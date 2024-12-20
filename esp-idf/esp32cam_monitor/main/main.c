/* WiFi station Example

   This example code is in the Public Domain (or CC0 licensed, at your option.)

   Unless required by applicable law or agreed to in writing, this
   software is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
   CONDITIONS OF ANY KIND, either express or implied.
*/
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "esp_log.h"
#include "nvs_flash.h"

#include "lwip/err.h"
#include "lwip/sys.h"

#define EXAMPLE_ESP_WIFI_SSID CONFIG_ROUTER_SSID
#define EXAMPLE_ESP_WIFI_PASS CONFIG_ROUTER_PASSWORD
#define EXAMPLE_ESP_MAXIMUM_RETRY 10

static EventGroupHandle_t s_wifi_event_group;

#define WIFI_CONNECTED_BIT BIT0
#define WIFI_FAIL_BIT BIT1

static const char *TAG = "wifi station";

static int s_retry_num = 0;

static void event_handler(void *arg, esp_event_base_t event_base,
                          int32_t event_id, void *event_data)
{
     if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_START)
     {
          esp_wifi_connect();
     }
     else if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_DISCONNECTED)
     {
          if (s_retry_num < EXAMPLE_ESP_MAXIMUM_RETRY)
          {
               esp_wifi_connect();
               s_retry_num++;
               ESP_LOGI(TAG, "retry to connect to the AP");
          }
          else
          {
               xEventGroupSetBits(s_wifi_event_group, WIFI_FAIL_BIT);
          }
          ESP_LOGI(TAG, "connect to the AP fail");
     }
     else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP)
     {
          ip_event_got_ip_t *event = (ip_event_got_ip_t *)event_data;
          ESP_LOGI(TAG, "got ip:" IPSTR, IP2STR(&event->ip_info.ip));
          s_retry_num = 0;
          xEventGroupSetBits(s_wifi_event_group, WIFI_CONNECTED_BIT);
     }
}

void wifi_init_sta(void)
{
     s_wifi_event_group = xEventGroupCreate();

     ESP_ERROR_CHECK(esp_netif_init());

     ESP_ERROR_CHECK(esp_event_loop_create_default());
     esp_netif_create_default_wifi_sta();

     wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
     ESP_ERROR_CHECK(esp_wifi_init(&cfg));

     esp_event_handler_instance_t instance_any_id;
     esp_event_handler_instance_t instance_got_ip;
     ESP_ERROR_CHECK(esp_event_handler_instance_register(WIFI_EVENT,
                                                         ESP_EVENT_ANY_ID,
                                                         &event_handler,
                                                         NULL,
                                                         &instance_any_id));
     ESP_ERROR_CHECK(esp_event_handler_instance_register(IP_EVENT,
                                                         IP_EVENT_STA_GOT_IP,
                                                         &event_handler,
                                                         NULL,
                                                         &instance_got_ip));

     wifi_config_t wifi_config = {
         .sta = {
             .ssid = EXAMPLE_ESP_WIFI_SSID,
             .password = EXAMPLE_ESP_WIFI_PASS,
             .threshold.authmode = WIFI_AUTH_WPA2_PSK,
             .scan_method = WIFI_FAST_SCAN,
             .sort_method = WIFI_CONNECT_AP_BY_SIGNAL,
         },
     };
     ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
     ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config));
     ESP_ERROR_CHECK(esp_wifi_start());

     ESP_LOGI(TAG, "wifi_init_sta finished.");

     EventBits_t bits = xEventGroupWaitBits(s_wifi_event_group,
                                            WIFI_CONNECTED_BIT | WIFI_FAIL_BIT,
                                            pdFALSE,
                                            pdFALSE,
                                            portMAX_DELAY);

     if (bits & WIFI_CONNECTED_BIT)
     {
          ESP_LOGI(TAG, "connected to ap SSID:%s password:%s",
                   EXAMPLE_ESP_WIFI_SSID, EXAMPLE_ESP_WIFI_PASS);
     }
     else if (bits & WIFI_FAIL_BIT)
     {
          ESP_LOGI(TAG, "Failed to connect to SSID:%s, password:%s",
                   EXAMPLE_ESP_WIFI_SSID, EXAMPLE_ESP_WIFI_PASS);
     }
     else
     {
          ESP_LOGE(TAG, "UNEXPECTED EVENT");
     }
}

void app_main(void)
{
     esp_err_t ret = nvs_flash_init();
     if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND)
     {
          ESP_ERROR_CHECK(nvs_flash_erase());
          ret = nvs_flash_init();
     }
     ESP_ERROR_CHECK(ret);

     ESP_LOGI(TAG, "ESP_WIFI_MODE_STA");
     wifi_init_sta();
}