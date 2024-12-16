#include "setup_esp_websocket_client.h"
#include "mbedtls/bignum.h" // Add this line to include the mbedtls_mpi type
#include "mbedtls/md.h"
#include "nvs_flash.h" // Add this line to include NVS functions
#include "nvs.h"       // Add this line to include NVS functions
#include <string.h>
#include <stdlib.h>
#include "esp_log.h"
#include "esp_http_client.h"

#define STACK_SIZE 32 * 1024 // Increased from 4K to 8K

typedef struct
{
     char *apiKey;
     uint64_t *secretKey;
     esp_websocket_client_handle_t ws_client;
} params_struct;

const char *TAG = "websocket_client";
uint8_t hmacResult[32];
uint8_t *encrypted_data = NULL;

TaskHandle_t pv_task_send_image_to_websocket = NULL;

void ws_connected_cb()
{

     if (pv_task_send_image_to_websocket != NULL)
          vTaskResume(pv_task_send_image_to_websocket);

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

void task_send_image_to_websocket(params_struct *params)
{
     uint64_t last_send_time = esp_timer_get_time();

     while (true)
     {
          ESP_LOGI(TAG, "api key: %s", params->apiKey);
          ESP_LOGI(TAG, "secret key: %llu", *(params->secretKey));

          camera_fb_t *fb = esp_camera_fb_get();
          if (!fb)
          {
               ESP_LOGE(TAG, "Camera Capture Failed");
               vTaskDelay(1000 / portTICK_PERIOD_MS); // Add delay on error
               continue;
          }

          // Ensure memory allocation
          size_t enc_len = (fb->len / AES_BLOCK_SIZE + 1) * AES_BLOCK_SIZE;

          // Call AES encryption function
          if (aes_encrypt_custom((const unsigned char *)fb->buf, fb->len, (const unsigned char *)encrypted_data, hmacResult) == 0)
          {
               printf("encrypted data: %d", enc_len);
               for (int i = enc_len - 100; i < enc_len; i++)
               {
                    printf("%02x ", encrypted_data[i]);
               }
               printf("\n");
          }

          int send_result = esp_websocket_client_send_bin(
              params->ws_client,
              (char *)encrypted_data,
              enc_len,
              pdMS_TO_TICKS(5000));

          esp_camera_fb_return(fb);

          if (true)
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
          // vTaskDelay(10 / portTICK_PERIOD_MS);
     }
}

void setup_esp_websocket_client_init(char *apiKey, uint64_t *secretKey)
{
     char *uri = heap_caps_malloc(200, MALLOC_CAP_SPIRAM);
     sprintf(uri,
             "ws://%s:%d/?source=%s",
             CONFIG_WEBSERVER_IP,
             CONFIG_WEBSERVER_PORT,
             "esp32cam_security_gate_send_img");

     encrypted_data = heap_caps_malloc(40000, MALLOC_CAP_SPIRAM);
     esp_websocket_client_config_t ws_cfg = {
         .uri = uri,
         .buffer_size = 16 * 1024,
         .reconnect_timeout_ms = 500,
         .network_timeout_ms = 5000,
     };
     esp_websocket_client_handle_t ws_client = esp_websocket_client_init(&ws_cfg);
     params_struct *params = heap_caps_malloc(sizeof(params_struct), MALLOC_CAP_SPIRAM);

     mbedtls_md_context_t ctx;
     mbedtls_md_type_t md_type = MBEDTLS_MD_SHA256;

     char *shaKey = "example-secret-key";
     char *secretKeyChar = malloc(30);

     sprintf(secretKeyChar, "%llu", *secretKey);

     const size_t payloadLength = strlen(secretKeyChar);
     const size_t keyLength = strlen(shaKey);

     ESP_LOGE(TAG, "Secret key: %s(%d)", secretKeyChar, payloadLength);

     mbedtls_md_init(&ctx);
     mbedtls_md_setup(&ctx, mbedtls_md_info_from_type(md_type), 1);
     mbedtls_md_hmac_starts(&ctx, (const unsigned char *)shaKey, keyLength);
     mbedtls_md_hmac_update(&ctx, (const unsigned char *)secretKeyChar, payloadLength);
     mbedtls_md_hmac_finish(&ctx, hmacResult);
     mbedtls_md_free(&ctx);

     for (int i = 0; i < sizeof(hmacResult); i++)
     {
          printf("Byte %d: %02x \n", i + 1, (int)hmacResult[i]);
     }

     params->apiKey = apiKey;
     params->secretKey = secretKey;
     params->ws_client = ws_client;

     esp_websocket_client_append_header(ws_client, "X-API-KEY", apiKey);

     xTaskCreate(
         task_send_image_to_websocket,
         "send_image_to_websocket",
         STACK_SIZE,
         params,
         tskIDLE_PRIORITY + 1, // Lower priority than configMAX_PRIORITIES - 1
         &pv_task_send_image_to_websocket);
     vTaskSuspend(pv_task_send_image_to_websocket);

     esp_websocket_client_start(ws_client);
     esp_websocket_register_events(ws_client, WEBSOCKET_EVENT_CONNECTED, ws_connected_cb, NULL);
     esp_websocket_register_events(ws_client, WEBSOCKET_EVENT_ERROR, ws_error_cb, NULL);
     esp_websocket_register_events(ws_client, WEBSOCKET_EVENT_DISCONNECTED, ws_connected_cb, NULL);
}