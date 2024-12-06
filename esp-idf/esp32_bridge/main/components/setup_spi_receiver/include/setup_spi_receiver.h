#include <stdio.h>
#include <stdint.h>
#include <stddef.h>
#include <string.h>

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#include "esp_timer.h"
#include "esp_log.h"
#include "esp_websocket_client.h"
#include "driver/spi_slave.h"
#include "driver/gpio.h"

#define GPIO_HANDSHAKE 2
#define GPIO_MOSI 13
#define GPIO_MISO 12
#define GPIO_SCLK 14
#define GPIO_CS 15
#define RCV_HOST HSPI_HOST

const static char *SETUP_SPI_RECEIVER_TAG = "SETUP_SPI_RECEIVER";

void setup_spi_receiver();
