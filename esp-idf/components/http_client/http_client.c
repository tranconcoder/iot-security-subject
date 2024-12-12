#include "http_client.h"

static const char *TAG = "HTTP_EVENT";

void print_http_event(esp_http_client_event_t *evt)
{
     ESP_LOGI(TAG, "Handle event for url: %s", evt->client->config->uri);

     switch (evt->event_id)
     {
     case HTTP_EVENT_ERROR:
          ESP_LOGD(TAG, "HTTP_EVENT_ERROR");
          break;
     case HTTP_EVENT_ON_CONNECTED:
          ESP_LOGD(TAG, "HTTP_EVENT_ON_CONNECTED");
          break;
     case HTTP_EVENT_HEADER_SENT:
          ESP_LOGD(TAG, "HTTP_EVENT_HEADER_SENT");
          break;
     case HTTP_EVENT_ON_HEADER:
          ESP_LOGD(TAG, "HTTP_EVENT_ON_HEADER, key=%s, value=%s", evt->header_key, evt->header_value);
          break;
     case HTTP_EVENT_ON_DATA:
          ESP_LOGD(TAG, "HTTP_EVENT_ON_DATA, len=%d", evt->data_len);
          break;
     case HTTP_EVENT_ON_FINISH:
          ESP_LOGD(TAG, "HTTP_EVENT_ON_FINISH");
          break;
     case HTTP_EVENT_DISCONNECTED:
          ESP_LOGI(TAG, "HTTP_EVENT_DISCONNECTED");
          break;
     case HTTP_EVENT_REDIRECT:
          ESP_LOGD(TAG, "HTTP_EVENT_REDIRECT");
          break;
     }
     return ESP_OK;
}