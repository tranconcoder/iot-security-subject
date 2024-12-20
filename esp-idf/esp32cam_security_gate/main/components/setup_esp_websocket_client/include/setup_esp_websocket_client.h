#include "esp_websocket_client.h"
#include "setup_esp32_cam.h"
#include "esp_log.h"
#include "esp_camera.h"
#include "common_struct.h"
#include "freertos/task.h"
#include "nvs.h"
#include "nvs_flash.h"
#include "config_http_client.h"
#include "esp_http_client.h"
#include "aes-custom.h"
#include "mbedtls/bignum.h"
#include <string.h>
#include <stdlib.h>

static bool websocket_connecting;
void setup_esp_websocket_client_init(char *apiKey, uint64_t *secretKey);
