#include "setup_rc522.h"

static rc522_handle_t scanner;
static const char *SETUP_RC522_TAG = "setup_rc522";

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
    camera_fb_t *fb = esp_camera_fb_get();

    if (!fb)
        return;

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
    // Convert buffer to base64
    size_t outlen;
    unsigned char *base64 = heap_caps_malloc(50000, MALLOC_CAP_SPIRAM);

    mbedtls_base64_encode(base64, 50000, &outlen, (unsigned char *)fb->buf, fb->len);
    esp_camera_fb_return(fb);
    // ESP_LOGI(SETUP_RC522_TAG, "%d %s", outlen, base64);
    // ESP_LOGI(SETUP_RC522_TAG, "%d", outlen);

    esp_http_client_set_method(client, HTTP_METHOD_POST);
    esp_http_client_set_header(client, "Content-Type", "text/plain");
    esp_http_client_set_post_field(client, (const char *)base64, outlen);

    esp_http_client_perform(client);
    esp_http_client_cleanup(client);
    heap_caps_free(base64);
}

void setup_rc522()
{
    rc522_config_t rc522_config = {
        .spi.host = VSPI_HOST,
        .spi.miso_gpio = 12,
        .spi.mosi_gpio = 13,
        .spi.sck_gpio = 14,
        .spi.sda_gpio = 15,
    };

    rc522_create(&rc522_config, &scanner);
    rc522_register_events(scanner, RC522_EVENT_ANY, rc522_handler, on_tag_scanned);
    rc522_start(scanner);
}
