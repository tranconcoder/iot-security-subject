#include "esp_log.h"
#include "mbedtls/aes.h"
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include "esp_heap_caps.h"

void encrypt_any_length_string(const char *input, uint8_t *key, uint8_t *iv);
size_t convert_hex(uint8_t *dest, size_t count, const char *src);