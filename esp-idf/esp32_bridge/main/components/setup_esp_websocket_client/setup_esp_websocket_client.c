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

esp_websocket_client_handle_t setup_esp_websocket_client_init()
{
     esp_websocket_client_handle_t ws_client = esp_websocket_client_init(&ws_cfg);

     esp_websocket_client_start(ws_client);
     esp_websocket_register_events(ws_client, WEBSOCKET_EVENT_CONNECTED, ws_connected_cb, NULL);
     esp_websocket_register_events(ws_client, WEBSOCKET_EVENT_ERROR, ws_error_cb, NULL);
     esp_websocket_register_events(ws_client, WEBSOCKET_EVENT_DISCONNECTED, ws_connected_cb, NULL);

     return ws_client;
}
