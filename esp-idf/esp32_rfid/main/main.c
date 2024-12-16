#include "rc522.h"
#include <esp_log.h>
#include <inttypes.h>
#include "driver/gpio.h"
#include "mbedtls/base64.h"
#include "esp_http_client.h"
#include <stdio.h>
#include "esp_mac.h"
#include "esp_wifi.h"
#include "nvs_flash.h"

#define STACK_SIZE 4 * 1024

#define WIFI_CONNECTED_BIT BIT0
#define WIFI_FAIL_BIT BIT1

#define EXAMPLE_ESP_WIFI_SSID CONFIG_ROUTER_SSID
#define EXAMPLE_ESP_WIFI_PASS CONFIG_ROUTER_PASSWORD
#define EXAMPLE_ESP_MAXIMUM_RETRY 10

static int g_sockfd;
static rc522_handle_t scanner;
static const char *TAG = "setup_rc522";
static const char *HTTP_CLIENT_TAG = "HTTP_CLIENT";
static const char *SETUP_RC522_TAG = "setup_rc522";

static int s_retry_num = 0;
static EventGroupHandle_t s_wifi_event_group;

esp_err_t _http_event_handle(esp_http_client_event_t *evt)
{
     switch (evt->event_id)
     {
     case HTTP_EVENT_ERROR:
          ESP_LOGI(HTTP_CLIENT_TAG, "HTTP_EVENT_ERROR");
          break;
     case HTTP_EVENT_ON_CONNECTED:
          ESP_LOGI(HTTP_CLIENT_TAG, "HTTP_EVENT_ON_CONNECTED");
          break;
     case HTTP_EVENT_HEADER_SENT:
          ESP_LOGI(HTTP_CLIENT_TAG, "HTTP_EVENT_HEADER_SENT");
          break;
     case HTTP_EVENT_ON_HEADER:
          ESP_LOGI(HTTP_CLIENT_TAG, "HTTP_EVENT_ON_HEADER");
          printf("%s: %s", evt->header_key, (char *)evt->header_value);

          if (!strcmp(evt->header_key, "X-API-KEY"))
          {
               esp_http_client_set_header(evt->client, evt->header_key, evt->header_value);
          }
          break;
     case HTTP_EVENT_ON_DATA:
          ESP_LOGI(HTTP_CLIENT_TAG, "HTTP_EVENT_ON_DATA, len=%d", evt->data_len);
          if (!esp_http_client_is_chunked_response(evt->client))
          {
               printf("%.*s", evt->data_len, (char *)evt->data);
          }

          break;
     case HTTP_EVENT_ON_FINISH:
          ESP_LOGI(HTTP_CLIENT_TAG, "HTTP_EVENT_ON_FINISH");
          break;
     case HTTP_EVENT_DISCONNECTED:
          ESP_LOGI(HTTP_CLIENT_TAG, "HTTP_EVENT_DISCONNECTED");
          break;
     case HTTP_EVENT_REDIRECT:
          ESP_LOGI(HTTP_CLIENT_TAG, "HTTP_EVENT_REDIRECT");
          break;
     }
     return ESP_OK;
}

static void rc522_handler(void (*on_tag_scanned)(uint64_t serial_number), esp_event_base_t base, int32_t event_id, void *event_data)
{
     rc522_event_data_t *data = (rc522_event_data_t *)event_data;

     switch (event_id)
     {
     case RC522_EVENT_TAG_SCANNED:
     {
          rc522_tag_t *tag = (rc522_tag_t *)data->ptr;
          uint64_t serial_number = tag->serial_number;
          on_tag_scanned(serial_number);
          break;
     }
     default:
     {
          ESP_LOGI(SETUP_RC522_TAG, "Unknown tag event rc522!");
     }
     }
}

void on_tag_scanned(uint64_t serial_number)
{
     char http_path[55];
     sprintf(http_path, "/api/security-gate/auth-door/?s=%022llu", serial_number);
     ESP_LOGI(SETUP_RC522_TAG, "TAG SCANNED: %llu", serial_number);
     esp_http_client_config_t http_webserver_config = {
         .host = CONFIG_WEBSERVER_IP,
         .port = CONFIG_WEBSERVER_PORT,
         .path = http_path,
         .event_handler = _http_event_handle,
     };
     esp_http_client_handle_t client = esp_http_client_init(&http_webserver_config);

     esp_http_client_set_method(client, HTTP_METHOD_POST);
     esp_http_client_set_header(client, "Content-Type", "text/plain");

     esp_http_client_perform(client);
     esp_http_client_cleanup(client);
}

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
             .ssid = CONFIG_ROUTER_SSID,
             .password = CONFIG_ROUTER_PASSWORD,
             .threshold.authmode = WIFI_AUTH_WPA2_PSK,
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

     ESP_LOGI(TAG, "ESP_WIFI_MODE_STA");
     wifi_init_sta();

     rc522_config_t rc522_config = {
         .spi.host = VSPI_HOST,
         .spi.miso_gpio = 19,
         .spi.mosi_gpio = 23,
         .spi.sck_gpio = 21,
         .spi.sda_gpio = 18,
     };

     rc522_create(&rc522_config, &scanner);
     rc522_register_events(scanner, RC522_EVENT_ANY, rc522_handler, on_tag_scanned);
     rc522_start(scanner);
}
