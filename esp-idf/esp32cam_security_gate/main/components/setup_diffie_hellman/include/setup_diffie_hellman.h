#include <stdio.h>
#include "esp_log.h"
#include "esp_random.h"
#include "esp_http_client.h"
#include "nvs_flash.h"
#include "mbedtls/bignum.h"
#include "cJSON.h"
#include "common_struct.h"
#include "http_client_utils.h"

uint64_t getSecretKey();
uint64_t getApiKey();

void setup_diffie_hellman();
