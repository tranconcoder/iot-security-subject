idf_component_register(SRCS "setup_diffie_hellman.c"
                    INCLUDE_DIRS "include"
                    REQUIRES esp_http_client nvs_flash mbedtls json common_struct http_client_utils setup_esp_websocket_client)
