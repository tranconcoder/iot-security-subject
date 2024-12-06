#include "esp_websocket_client.h"
#include "esp_log.h"
#include "common_struct.h"
#include "freertos/task.h"
#include "nvs_flash.h"
#include "setup_esp32_cam.h"
#include "esp_camera.h"

static bool websocket_connecting;

void setup_esp_websocket_client_init();