#include <inttypes.h>
#include "freertos/FreeRTOS.h"
#include "freertos/timers.h"
#include "freertos/task.h"
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
#include "setup_spi.h"

#include "esp_tls.h"
#include "esp_event.h"
#include "esp_netif.h"

// TASK STACK SIZE
#define STACK_SIZE 4 * 1024

static int g_sockfd = -1;
static const char *TAG = "main";

/*
 */

static esp_err_t esp_storage_init(void)
{
    esp_err_t ret = nvs_flash_init();

    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND)
    {
        // NVS partition was truncated and needs to be erased
        // Retry nvs_flash_init
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }

    return ret;
}

void app_main()
{
    esp_log_level_set("*", ESP_LOG_INFO);

    esp_storage_init();

    // Init camera
    esp_err_t init_camera = setup_esp32_cam();
    while (init_camera != ESP_OK)
    {
        ESP_LOGI(TAG, "Camera deiniting...");
        init_camera = esp_camera_deinit();
        vTaskDelay(pdMS_TO_TICKS(3000));
    }

    sensor_t *s = esp_camera_sensor_get();
    s->set_brightness(s, 2);
    s->set_saturation(s, 200);
    s->set_sharpness(s, 200);

    setup_esp_websocket_client_init();
    // setup_rc522();
    // setup_spi();

    while (true)
    {
        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}
