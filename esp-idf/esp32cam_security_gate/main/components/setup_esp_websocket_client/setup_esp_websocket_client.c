#include "setup_esp_websocket_client.h"
#include "mbedtls/bignum.h" // Add this line to include the mbedtls_mpi type

#define STACK_SIZE 4 * 1024

const char *TAG = "websocket_client";

extern const uint8_t ca_pem_start[] asm("_binary_ca_pem_start");
extern const uint8_t ca_pem_end[] asm("_binary_ca_pem_end");

TaskHandle_t pv_task_send_image_to_websocket = NULL;
const esp_websocket_client_config_t ws_cfg = {
    .uri = "ws://192.168.1.210:3000/?source=esp32cam_security_gate_send_img",
    .buffer_size = 16 * 1024,
    .reconnect_timeout_ms = 500,
    .network_timeout_ms = 5000,
};

void ws_connected_cb()
{
     if (pv_task_send_image_to_websocket != NULL)
     {
          vTaskResume(pv_task_send_image_to_websocket);

          esp_http_client_config_t http_webserver_config = {
              .url = "http://192.168.1.210:3000/api/security-gate/init",
              .event_handler = _http_event_handle,
              .timeout_ms = 3000,
          };
          esp_http_client_handle_t client = esp_http_client_init(&http_webserver_config);

          // Generate random numbers for pKey, gKey, and AKey
          size_t gKey;
          size_t pKey;
          uint32_t aKey;

     run:
          gKey = esp_random() % 1000;
          pKey = gKey + (esp_random() % 1000000);
          aKey = esp_random() % 100;

          mbedtls_mpi pKey_mpi, gKey_mpi, aKey_mpi, AKey_mpi;
          mbedtls_mpi_init(&pKey_mpi);
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
               mbedtls_mpi_free(&pKey_mpi);
               mbedtls_mpi_free(&gKey_mpi);
               mbedtls_mpi_free(&aKey_mpi);
               mbedtls_mpi_free(&AKey_mpi);
               goto run;
          }

          // Get required size first
          size_t olen;
          char AKey_str[256] = {0};
          if ((ret = mbedtls_mpi_write_string(&AKey_mpi, 10, NULL, 0, &olen)) != MBEDTLS_ERR_MPI_BUFFER_TOO_SMALL)
          {
               ESP_LOGE(TAG, "Failed to get required buffer size: %d", ret);
               goto cleanup;
          }

          if (olen > sizeof(AKey_str))
          {
               ESP_LOGE(TAG, "Buffer too small for AKey");
               goto cleanup;
          }

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
          ESP_LOGI(TAG, "========= Generated keys: pKey=%lu, gKey=%lu, AKey=%s", (unsigned long)pKey, (unsigned long)gKey, AKey_str);
          esp_http_client_set_method(client, HTTP_METHOD_POST);
          esp_http_client_set_header(client, "Content-Type", "application/json");
          esp_http_client_set_post_field(client, json_string, strlen(json_string));

          esp_http_client_perform(client);

     cleanup:
          mbedtls_mpi_free(&pKey_mpi);
          mbedtls_mpi_free(&gKey_mpi);
          mbedtls_mpi_free(&aKey_mpi);
          mbedtls_mpi_free(&AKey_mpi);

          esp_http_client_cleanup(client);
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

void task_send_image_to_websocket(esp_websocket_client_handle_t ws_client)
{
     uint64_t last_send_time = esp_timer_get_time();
     TickType_t current_tick;
     ESP_LOGI(TAG, "task_send_image_to_websocket");

     while (true)
     {
          camera_fb_t *fb = esp_camera_fb_get();

          if (!fb)
          {
               ESP_LOGE(TAG, "Camera Capture Failed");
               continue;
          }

          int send_result = esp_websocket_client_send_bin(ws_client, (char *)fb->buf, fb->len, 5000 / portTICK_PERIOD_MS);

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
               ESP_LOGW(TAG, "Send frame error!");

          esp_camera_fb_return(fb);
     }
}

void setup_esp_websocket_client_init()
{

     esp_websocket_client_handle_t ws_client = esp_websocket_client_init(&ws_cfg);

     xTaskCreate(
         task_send_image_to_websocket,
         "send_image_to_websocket",
         STACK_SIZE,
         ws_client,
         configMAX_PRIORITIES - 1,
         &pv_task_send_image_to_websocket);
     vTaskSuspend(pv_task_send_image_to_websocket);

     esp_websocket_client_start(ws_client);
     esp_websocket_register_events(ws_client, WEBSOCKET_EVENT_CONNECTED, ws_connected_cb, NULL);
     esp_websocket_register_events(ws_client, WEBSOCKET_EVENT_ERROR, ws_error_cb, NULL);
     esp_websocket_register_events(ws_client, WEBSOCKET_EVENT_DISCONNECTED, ws_connected_cb, NULL);
}
