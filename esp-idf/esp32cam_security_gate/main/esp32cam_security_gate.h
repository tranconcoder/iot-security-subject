#include <inttypes.h>
#include "freertos/FreeRTOS.h"
#include "freertos/timers.h"
#include "freertos/task.h"
#include "esp_mac.h"
#include "esp_wifi.h"
#include "esp_bridge.h"
#include "esp_mesh_lite.h"
#include "esp_log.h"
#include <esp_system.h>
#include "nvs_flash.h"
#include <stdint.h>
#include <sys/param.h>
#include <sys/socket.h>
#include <stdlib.h>
#include "driver/gpio.h"
#include <stdio.h>

#include "setup_rc522.h"
#include "setup_esp32_cam.h"
#include "config_http_client.h"
#include "esp_websocket_client.h"
#include "setup_esp_websocket_client.h"

#include "esp_tls.h"
#include "esp_event.h"
#include "esp_netif.h"

// TASK STACK SIZE
#define STACK_SIZE 4 * 1024

static int g_sockfd;