#include "esp_websocket_client.h"
#include "esp_log.h"
#include "common_struct.h"
#include "freertos/task.h"
#include "nvs_flash.h"

static bool websocket_connecting;

esp_websocket_client_handle_t setup_esp_websocket_client_init();