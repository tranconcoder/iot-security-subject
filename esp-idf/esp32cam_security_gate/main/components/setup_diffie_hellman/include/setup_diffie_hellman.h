#include <stdio.h>
#include "esp_log.h"
#include "esp_random.h"
#include "esp_http_client.h"
#include "nvs_flash.h"
#include "mbedtls/bignum.h"
#include "cJSON.h"
#include "common_struct.h"
#include "http_client_utils.h"
#include "setup_esp_websocket_client.h"

typedef struct
{
     uint64_t aKey;
     uint64_t pKey;
     uint64_t gKey;
     uint64_t AKey;
     uint64_t BKey;
     uint64_t *SKey;
} key_struct;

void setup_diffie_hellman();
