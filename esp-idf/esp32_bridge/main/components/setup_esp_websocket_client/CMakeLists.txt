idf_component_register(SRCS "setup_esp_websocket_client.c"
                    INCLUDE_DIRS "include"
                    REQUIRES esp-websocket_client nvs_flash common_struct esp_timer)
