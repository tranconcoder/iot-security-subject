#include "setup_esp_websocket_client.h"
#include "mbedtls/bignum.h" // Add this line to include the mbedtls_mpi type
#include "nvs_flash.h"      // Add this line to include NVS functions
#include "nvs.h"            // Add this line to include NVS functions
#include <string.h>
#include <stdlib.h>
#include "esp_log.h"
#include "esp_http_client.h"

#define STACK_SIZE 8 * 1024 // Increased from 4K to 8K

const char *TAG = "websocket_client";

extern const uint8_t ca_pem_start[] asm("_binary_ca_pem_start");
extern const uint8_t ca_pem_end[] asm("_binary_ca_pem_end");
char headers[256];

TaskHandle_t pv_task_send_image_to_websocket = NULL;
esp_websocket_client_config_t ws_cfg = {
    .uri = "ws://192.168.23.35:3000/?source=esp32cam_security_gate_send_img",
    .buffer_size = 16 * 1024,
    .reconnect_timeout_ms = 500,
    .network_timeout_ms = 5000,
    .headers = headers,
};

esp_err_t http_event_handle(esp_http_client_event_t *evt);
esp_http_client_config_t http_webserver_config = {
    .url = "http://192.168.23.35:3000/api/security-gate/init",
    .event_handler = http_event_handle,
    .timeout_ms = 3000,
    .keep_alive_enable = true,
};

esp_http_client_handle_t *client = NULL;
esp_websocket_client_handle_t *ws_client = NULL;
char SKey_str[256];
char *apiKey;
char *resData = NULL;
size_t resDataLen = 0;

// Function to store apiKey in NVS
void store_api_key(const char *key)
{
     nvs_handle_t nvs_handle;
     esp_err_t err = nvs_open("storage", NVS_READWRITE, &nvs_handle);
     if (err == ESP_OK)
     {
          nvs_set_str(nvs_handle, "apiKey", key);
          nvs_commit(nvs_handle);
          nvs_close(nvs_handle);
     }
     else
     {
          ESP_LOGE(TAG, "Error (%s) opening NVS handle!", esp_err_to_name(err));
     }
}

// Function to load apiKey from NVS
void load_api_key()
{
     nvs_handle_t nvs_handle;
     esp_err_t err = nvs_open("storage", NVS_READONLY, &nvs_handle);
     if (err == ESP_OK)
     {
          size_t required_size;
          err = nvs_get_str(nvs_handle, "apiKey", NULL, &required_size);
          if (err == ESP_OK)
          {
               apiKey = malloc(required_size);
               nvs_get_str(nvs_handle, "apiKey", apiKey, &required_size);
               sprintf(headers, "X-API-KEY: %s\r\n", apiKey);
          }
          nvs_close(nvs_handle);
     }
     else
     {
          ESP_LOGE(TAG, "Error (%s) opening NVS handle!", esp_err_to_name(err));
     }
}

esp_err_t http_event_handle(esp_http_client_event_t *evt)
{
     switch (evt->event_id)
     {
     case HTTP_EVENT_ON_CONNECTED:
          ESP_LOGI(TAG, "HTTP_EVENT_ON_CONNECTED");
          // Clear resData when new connection established
          if (resData != NULL)
          {
               memset(resData, 0, resDataLen);
               resDataLen = 0;
          }
          break;

     case HTTP_EVENT_ON_HEADER:
          ESP_LOGI(TAG, "HTTP_EVENT_ON_HEADER");
          char key[10];
          sprintf(key, "%s", evt->header_key);
          printf("'%s': %s", evt->header_key, (char *)evt->header_value);

          if (strcmp(key, "X-API-KEY") == 0)
          {
               apiKey = (char *)evt->header_value;
               store_api_key(apiKey); // Store apiKey in NVS
          }
          break;

     case HTTP_EVENT_ON_FINISH:
          ESP_LOGI(TAG, "HTTP_EVENT_ON_FINISH");
          printf("%.*s", evt->data_len, (char *)evt->data);
          break;

     case HTTP_EVENT_ON_DATA:
          if (!esp_http_client_is_chunked_response(evt->client))
          {
               ESP_LOGI(TAG, "HTTP_EVENT_ON_DATA, len=%d", evt->data_len);
               char *data = malloc(evt->data_len + 1);
               if (data == NULL)
               {
                    ESP_LOGE(TAG, "Failed to allocate memory for data");
                    return ESP_FAIL;
               }
               sprintf(data, "%.*s", evt->data_len, (char *)evt->data);

               // Reallocate resData to accommodate new data
               char *newResData = realloc(resData, resDataLen + evt->data_len + 1);
               if (newResData == NULL)
               {
                    ESP_LOGE(TAG, "Failed to reallocate memory for resData");
                    free(data);
                    return ESP_FAIL;
               }
               resData = newResData;

               // Concatenate new data to resData
               memcpy(resData + resDataLen, data, evt->data_len);
               resDataLen += evt->data_len;
               resData[resDataLen] = '\0'; // Null-terminate the string

               free(data);
          }
          break;
     default:
     }

     return ESP_OK;
};

void handleGetNewApiKey()
{
     // Generate random numbers for pKey, gKey, and AKey
     client = esp_http_client_init(&http_webserver_config);
     size_t gKey;
     size_t pKey;
     uint32_t aKey;

run:
     gKey = esp_random() % 100;
     pKey = gKey + (esp_random() % 1000000000000); //  1 Nghìn tỷ
     aKey = esp_random() % pKey;

     mbedtls_mpi pKey_mpi, gKey_mpi, aKey_mpi, AKey_mpi, BKey_mpi, SKey_mpi;
     mbedtls_mpi_init(&pKey_mpi);
     mbedtls_mpi_init(&BKey_mpi);
     mbedtls_mpi_init(&SKey_mpi);
     mbedtls_mpi_init(&gKey_mpi);
     mbedtls_mpi_init(&aKey_mpi);
     mbedtls_mpi_init(&AKey_mpi);

     int ret;
     if ((ret = mbedtls_mpi_lset(&pKey_mpi, pKey)) != 0 ||
         (ret = mbedtls_mpi_lset(&gKey_mpi, gKey)) != 0 ||
         (ret = mbedtls_mpi_lset(&aKey_mpi, aKey)) != 0)
     {
          ESP_LOGE(TAG, "Failed to set MPI values: %d", ret);
          goto cleanup;
     }

     // Calculate AKey = gKey^aKey % pKey
     if ((ret = mbedtls_mpi_exp_mod(&AKey_mpi, &gKey_mpi, &aKey_mpi, &pKey_mpi, NULL)) != 0)
     {
          ESP_LOGE(TAG, "Failed to calculate exp mod: %d", ret);
          goto run;
     }

     char AKey_str[256];
     size_t olen;
     if ((ret = mbedtls_mpi_write_string(&AKey_mpi, 10, AKey_str, sizeof(AKey_str), &olen)) != 0)
     {
          ESP_LOGE(TAG, "Failed to write MPI to string: %d", ret);
          goto cleanup;
     }

     // Create JSON
     char json_string[512];
     snprintf(json_string, sizeof(json_string), "{\"pKey\": %lu, \"gKey\": %lu, \"AKey\": \"%s\"}",
              (unsigned long)pKey, (unsigned long)gKey, AKey_str);

     // Continue with websocket setup only if no errors occurred
     ESP_LOGI(TAG, "========= Generated keys: pKey=%lu, gKey=%lu, AKey=%s, aKey=%lu", (unsigned long)pKey, (unsigned long)gKey, AKey_str, aKey);
     esp_http_client_set_method(client, HTTP_METHOD_POST);
     esp_http_client_set_header(client, "Content-Type", "application/json");
     if (apiKey)
     {
          esp_http_client_set_header(client, "X-API-KEY", apiKey);
     }
     esp_http_client_set_post_field(client, json_string, strlen(json_string));

     esp_err_t err = esp_http_client_perform(client);
     if (err == ESP_OK)
     {
          ESP_LOGI(TAG, "HTTP POST Status = %d, content_length = %llu",
                   esp_http_client_get_status_code(client),
                   esp_http_client_get_content_length(client));
          ESP_LOGI(TAG, "Response: %s", resData);

          char *trimmedResData = malloc(resDataLen - 1);
          if (trimmedResData == NULL)
          {
               ESP_LOGE(TAG, "Failed to allocate memory for trimmedResData");
               goto cleanup;
          }
          strncpy(trimmedResData, resData + 1, resDataLen - 2);
          trimmedResData[resDataLen - 2] = '\0';

          ESP_LOGI(TAG, "Trimmed response: %s", trimmedResData);

          // Read BKey from string
          if ((ret = mbedtls_mpi_read_string(&BKey_mpi, 10, trimmedResData)) != 0)
          {
               ESP_LOGE(TAG, "Failed to read BKey from string: %d", ret);
               free(trimmedResData);
               goto cleanup;
          }
          free(trimmedResData);

          // Calculate SKey = BKey^aKey % pKey
          if ((ret = mbedtls_mpi_exp_mod(&SKey_mpi, &BKey_mpi, &aKey_mpi, &pKey_mpi, NULL)) != 0)
          {
               ESP_LOGE(TAG, "Failed to calculate SKey: %d", ret);
               goto cleanup;
          }

          // Convert SKey to string
          if ((ret = mbedtls_mpi_write_string(&SKey_mpi, 10, SKey_str, sizeof(SKey_str), &olen)) != 0)
          {
               ESP_LOGE(TAG, "Failed to write SKey to string: %d", ret);
               goto cleanup;
          }

          ESP_LOGI(TAG, "Calculated shared secret (SKey): %s", SKey_str);

          vTaskResume(pv_task_send_image_to_websocket);
     }

cleanup:
     // Cleanup resources
     mbedtls_mpi_free(&pKey_mpi);
     mbedtls_mpi_free(&gKey_mpi);
     mbedtls_mpi_free(&aKey_mpi);
     mbedtls_mpi_free(&AKey_mpi);
     mbedtls_mpi_free(&BKey_mpi);
     mbedtls_mpi_free(&SKey_mpi);

     esp_http_client_cleanup(client);
}

void ws_connected_cb()
{

     if (pv_task_send_image_to_websocket != NULL)
     {
          handleGetNewApiKey();
     }

     ESP_LOGI(TAG, "WebSocket client connected");
}

void ws_disconnected_cb()
{
     vTaskSuspend(pv_task_send_image_to_websocket);
     ESP_LOGW(TAG, "WebSocket client disconnected");
}

void ws_error_cb()
{
     ESP_LOGE(TAG, "WebSocket client error");
}

void task_send_image_to_websocket()
{
     uint64_t last_send_time = esp_timer_get_time();

     while (true)
     {
          camera_fb_t *fb = esp_camera_fb_get();
          if (!fb)
          {
               ESP_LOGE(TAG, "Camera Capture Failed");
               vTaskDelay(1000 / portTICK_PERIOD_MS); // Add delay on error
               continue;
          }

          // Ensure memory allocation
          char *enc_input = heap_caps_malloc(fb->len, MALLOC_CAP_SPIRAM);
          if (!enc_input)
          {
               ESP_LOGE(TAG, "Failed to allocate memory for encryption");
               esp_camera_fb_return(fb);
               vTaskDelay(1000 / portTICK_PERIOD_MS);
               continue;
          }

          char enc_iv[16] = "1234567890123456";
          memcpy(enc_input, (char *)fb->buf, fb->len);

          encrypt_any_length_string(enc_input, (uint8_t *)fb->buf, (uint8_t *)enc_iv);

          int send_result = esp_websocket_client_send_bin(ws_client, (char *)fb->buf, fb->len, 5000 / portTICK_PERIOD_MS);

          // Free allocated memory
          free(enc_input);
          esp_camera_fb_return(fb);

          if (send_result != -1)
          {
               uint64_t current_time = esp_timer_get_time();
               ESP_LOGI(TAG,
                        "Image sent to WebSocket: %d bytes (%.1ffps)",
                        fb->len,
                        1000.0 / ((current_time - last_send_time) / 1000));
               last_send_time = current_time;
          }
          else
          {
               ESP_LOGW(TAG, "Send frame error!");
          }

          // Add small delay to prevent tight loop
          vTaskDelay(10 / portTICK_PERIOD_MS);
     }
}

void setup_esp_websocket_client_init(int *g_sockfd)
{
     resData = heap_caps_malloc(1000, MALLOC_CAP_SPIRAM);
     if (resData == NULL)
     {
          ESP_LOGE(TAG, "Failed to allocate memory for resData");
          return;
     }

     load_api_key(); // Load apiKey from NVS

     ws_cfg.headers = headers;
     ws_client = esp_websocket_client_init(&ws_cfg);

     xTaskCreate(
         task_send_image_to_websocket,
         "send_image_to_websocket",
         STACK_SIZE,
         ws_client,
         tskIDLE_PRIORITY + 1, // Lower priority than configMAX_PRIORITIES - 1
         &pv_task_send_image_to_websocket);
     vTaskSuspend(pv_task_send_image_to_websocket);

     esp_websocket_client_start(ws_client);
     esp_websocket_register_events(ws_client, WEBSOCKET_EVENT_CONNECTED, ws_connected_cb, NULL);
     esp_websocket_register_events(ws_client, WEBSOCKET_EVENT_ERROR, ws_error_cb, NULL);
     esp_websocket_register_events(ws_client, WEBSOCKET_EVENT_DISCONNECTED, ws_connected_cb, NULL);
}
