#include "setup_esp_websocket_client.h"

#define STACK_SIZE 4 * 1024

const char *TAG = "websocket_client";

TaskHandle_t pv_task_send_image_to_websocket = NULL;
const esp_websocket_client_config_t ws_cfg = {
    .host = CONFIG_WEBSERVER_IP,
    .port = CONFIG_WEBSERVER_PORT,
    .path = "/?source=esp32cam_security_gate_send_img",
    .buffer_size = 16 * 1024,
    .reconnect_timeout_ms = 500,
    .network_timeout_ms = 5000,
};

void ws_connected_cb()
{
     if (pv_task_send_image_to_websocket != NULL)
     {
          vTaskResume(pv_task_send_image_to_websocket);
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

          int send_result = esp_websocket_client_send_bin(
              ws_client,
              (char *)fb->buf,
              fb->len,
              pdMS_TO_TICKS(5000));

          if (send_result != -1)
          {
               uint64_t current_time = esp_timer_get_time();
               double frame_rate = 1000000.0 / (current_time - last_send_time);
               last_send_time = current_time;
               ESP_LOGI(TAG, "Frame rate: %.2f fps", frame_rate);
          }
          else
          {
               ESP_LOGW(TAG, "Send frame error!");
          }

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
