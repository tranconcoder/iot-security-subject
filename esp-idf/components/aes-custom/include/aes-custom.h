#include "esp_log.h"
#include "mbedtls/aes.h"
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include "esp_heap_caps.h"

void encrypt_any_length_string(const char *input, uint8_t *key, uint8_t *iv);