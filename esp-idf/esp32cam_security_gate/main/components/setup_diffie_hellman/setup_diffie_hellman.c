#include "setup_diffie_hellman.h"
#include "mbedtls/bignum.h"
#include "esp_random.h"

const char *HEADER_API_KEY = "X-API-KEY";

struct key_struct
{
     uint64_t aKey;
     uint64_t pKey;
     uint64_t gKey;
     uint64_t AKey;
     uint64_t BKey;
     uint64_t SKey;
     char *to_json()
     {
          if (keys == NULL)
          {
               return NULL;
          }

          cJSON *json = cJSON_CreateObject();
          if (json == NULL)
          {
               return NULL;
          }

          cJSON_AddNumberToObject(json, "aKey", aKey);
          cJSON_AddNumberToObject(json, "pKey", pKey);
          cJSON_AddNumberToObject(json, "gKey", gKey);
          cJSON_AddNumberToObject(json, "AKey", AKey);
          cJSON_AddNumberToObject(json, "BKey", BKey);
          cJSON_AddNumberToObject(json, "SKey", SKey);

          char *json_str = cJSON_PrintUnformatted(json);
          cJSON_Delete(json);

          return json_str;
     }
} *keys = NULL;

esp_err_t http_event_handle(esp_http_client_event_t *evt);

static char *apiKey;

// Generate default key in client side
void generateKey()
{
     int ret = 1;
     keys = malloc(sizeof(struct key_struct));
     mbedtls_mpi pKey_mpi, gKey_mpi, aKey_mpi, AKey_mpi;

     while (ret)
     {
          try
          {
               keys->gKey = esp_random() % UINT8_MAX;                   // gKey: 0 -> 100
               keys->pKey = MIN(keys->gKey + esp_random(), UINT32_MAX); // pKey: gKey -> 2^32
               keys->aKey = esp_random() % keys->pKey;                  // aKey: 1 -> pKey

               // Calculate AKey
               mbedtls_mpi_init(&pKey_mpi);
               mbedtls_mpi_init(&gKey_mpi);
               mbedtls_mpi_init(&aKey_mpi);
               mbedtls_mpi_init(&AKey_mpi);

               if ((ret = mbedtls_mpi_lset(&pKey_mpi, pKey)) != 0 ||
                   (ret = mbedtls_mpi_lset(&gKey_mpi, gKey)) != 0 ||
                   (ret = mbedtls_mpi_lset(&aKey_mpi, aKey)) != 0)
               {
                    ESP_LOGE(TAG, "Failed to set MPI values: %d", ret);
                    throw;
               }

               // Calculate AKey = gKey^aKey % pKey
               if ((ret = mbedtls_mpi_exp_mod(&AKey_mpi, &gKey_mpi, &aKey_mpi, &pKey_mpi, NULL)) != 0)
               {
                    ESP_LOGE(TAG, "Failed to calculate exp mod: %d", ret);
                    throw;
               }
               if ((ret = mbedtls_mpi_write_binary(&AKey_mpi, (unsigned char *)&keys->AKey, sizeof(keys->AKey))) != 0)
               {
                    ESP_LOGE(TAG, "Failed to write AKey to binary: %d", ret);
                    throw;
               }
          }
          catch ()
          {
               mbedtls_mpi_free(&pKey_mpi);
               mbedtls_mpi_free(&gKey_mpi);
               mbedtls_mpi_free(&aKey_mpi);
               mbedtls_mpi_free(&AKey_mpi);
          }
     }
}

void handle_http_event_new(esp_http_client_event_t *evt)
{
     // Handle print event information
     print_http_event(evt);

     static char *output_buffer; // Buffer to store response of http request from event handler
     static int output_len;      // Stores number of bytes read

     switch (evt->event_id)
     {
     case HTTP_EVENT_ON_DATA:
          // Clean the buffer in case of a new request
          if (output_len == 0 && evt->user_data)
          {
               // we are just starting to copy the output data into the use
               memset(evt->user_data, 0, MAX_HTTP_OUTPUT_BUFFER);
          }
          /*
           *  Check for chunked encoding is added as the URL for chunked encoding used in this example returns binary data.
           *  However, event handler can also be used in case chunked encoding is used.
           */
          if (!esp_http_client_is_chunked_response(evt->client))
          {
               // If user_data buffer is configured, copy the response into the buffer
               int copy_len = 0;
               if (evt->user_data)
               {
                    // The last byte in evt->user_data is kept for the NULL character in case of out-of-bound access.
                    copy_len = MIN(evt->data_len, (MAX_HTTP_OUTPUT_BUFFER - output_len));
                    if (copy_len)
                    {
                         memcpy(evt->user_data + output_len, evt->data, copy_len);
                    }
               }
               else
               {
                    int content_len = esp_http_client_get_content_length(evt->client);
                    if (output_buffer == NULL)
                    {
                         // We initialize output_buffer with 0 because it is used by strlen() and similar functions therefore should be null terminated.
                         output_buffer = (char *)calloc(content_len + 1, sizeof(char));
                         output_len = 0;
                         if (output_buffer == NULL)
                         {
                              ESP_LOGE(TAG, "Failed to allocate memory for output buffer");
                              return ESP_FAIL;
                         }
                    }
                    copy_len = MIN(evt->data_len, (content_len - output_len));
                    if (copy_len)
                    {
                         memcpy(output_buffer + output_len, evt->data, copy_len);
                    }
               }
               output_len += copy_len;
          }
          break;

     case HTTP_EVENT_ON_HEADER:
          char api_header_key[20];
          sprintf(api_header_key, "%s", evt->header_key);

          // Save x-api-key value to variable
          if (strcmp(api_header_key, HEADER_API_KEY) == 0)
          {
               apiKey = evt->header_value;
          }

          break;

     case HTTP_EVENT_ON_FINISH:
          ESP_LOGD(TAG, "HTTP_EVENT_ON_FINISH");
          if (output_buffer != NULL)
          {
               // Remove double slash from the response
               char *keyTrimmed = malloc(output_len - 1);
               strncpy(keyTrimmed, output_buffer + 1, output_len - 2);
               keyTrimmed[output_len - 2] = '\0';

               // Convert response to BKey (number)
               keys->BKey = atoi(keyTrimmed);

               free(output_buffer);
               output_buffer = NULL;
          }
          output_len = 0;
          break;
     }
}

void setup_diffie_hellman()
{
     // Load NVS
     esp_err_t ret = nvs_open("storage", NVS_READONLY, &nvs_handle);

     if (ret == ESP_OK)
     {
          size_t required_size_api_key, required_size_secret_key;
          nvs_get_str(nvs_handle, "apiKey", NULL, &required_size);
          nvs_get_i64(nvs_handle, "secretKey", NULL, &required_size);

          apiKey = malloc(required_size_api_key);
          keys->SKey = malloc(required_size_secret_key);

          nvs_get_str(nvs_handle, "apiKey", apiKey, &required_size_api_key);
          nvs_get_str(nvs_handle, "secretKey", keys->SKey, &required_size_secret_key);

          nvs_close(nvs_handle);
     }

     // Found apiKey ==> check if it's valid
     bool apiKeyValid = false;
     if (ret == ESP_OK)
     {
          ESP_LOGI(TAG, "apiKey found in NVS, checking apiKey is valid...");

          // Config HTTP client URI
          char *uri = heap_caps_malloc(100, MALLOC_CAP_SPIRAM);
          char *headerKey = "X-API-KEY";
          char *header = malloc(sizeof(headerKey) + sizeof(apiKey) + 3);

          sprintf(uri, "http://%s:%d/api/aes/check-api-key", CONFIG_SERVER_IP, CONFIG_SERVER_PORT);
          sprintf(header, "%s: %s", headerKey, apiKey);

          esp_http_client_config_t config = {
              .uri = &uri,
              .event_handler = print_http_event,
              .timeout_ms = 3000,
              .keep_alive_enable = true,
              .headers = header,
          };

          // Handle HTTP request
          int maxRetry = 3;
          do
          {
               esp_http_client_handle_t client = esp_http_client_init(&config);
               esp_http_client_set_method(client, HTTP_METHOD_PUT);

               ret = esp_http_client_perform(client);
               if (ret == ESP_OK)
               {
                    uint16_t code = esp_http_client_get_status_code(client);

                    ESP_LOGI(TAG, "HTTP PUT Status = %d, content_length = %llu",
                             code,
                             esp_http_client_get_content_length(client));

                    apiKeyValid = code == 200;
               }
               else
               {
                    ESP_LOGE(TAG, "HTTP PUT request failed: %s", esp_err_to_name(ret));
                    ESP_LOGI(TAG, "Retrying...");
                    vTaskDelay(pdMS_TO_TICKS(300));
               }
          } while ((maxRetry--) > 0 && ret != ESP_OK);

          // Cleanup
          free(headerKey);
          free(header);
          free(uri);
          esp_http_client_cleanup(client);
     }

     // Not found apiKey ==> Get new apiKey
     if (ret != ESP_OK || !apiKeyValid)
     {
          ESP_LOGI(TAG, "Key not found or invalid, getting new apiKey...");

          // Config HTTP client URI
          char *uri = heap_caps_malloc(100, MALLOC_CAP_SPIRAM);
          sprintf(uri, "http://%s:%d/api/aes/init", CONFIG_SERVER_IP, CONFIG_SERVER_PORT);

          esp_http_client_config_t config = {
              .uri = &uri,
              .event_handler = http_event_handle,
              .timeout_ms = 3000,
              .keep_alive_enable = true,
          };

          // Generate new client key
          generateKey(); // Save key on "keys" variable

          uint8_t maxRetry = 3;
          do
          {
               ESP_LOGI(TAG, "Sending new key to server...");

               esp_client_handle_t client = esp_http_client_init(&config);

               esp_http_client_set_method(client, HTTP_METHOD_POST);
               esp_http_client_set_post_field(client, keys->to_json(), strlen(keys->to_json()));
               ret = esp_http_client_perform(client);

               if (ret == ESP_OK)
               {
                    ESP_LOGI(TAG, "HTTP POST Status = %d, content_length = %llu",
                             esp_http_client_get_status_code(client),
                             esp_http_client_get_content_length(client));
                    ESP_LOGI(TAG, "Generate SKey...");

                    // Create Secret key from BKey
                    mbedtls_mpi BKey_mpi, SKey_mpi, aKey_mpi, pKey_mpi;

                    mbedtls_mpi_init(&BKey_mpi);
                    mbedtls_mpi_init(&SKey_mpi);
                    mbedtls_mpi_init(&aKey_mpi);
                    mbedtls_mpi_init(&pKey_mpi);

                    if ((ret = mbedtls_mpi_lset(&BKey_mpi, keys->BKey)) != 0 ||
                        (ret = mbedtls_mpi_lset(&aKey_mpi, keys->aKey)) != 0 ||
                        (ret = mbedtls_mpi_lset(&pKey_mpi, keys->pKey)) != 0)
                    {
                         ESP_LOGE(TAG, "Failed to set MPI values: %d", ret);
                         continue;
                    }

                    // Calculate SKey = BKey^aKey % pKey
                    if ((ret = mbedtls_mpi_exp_mod(&SKey_mpi, &BKey_mpi, &aKey_mpi, &pKey_mpi, NULL)) != 0)
                    {
                         ESP_LOGE(TAG, "Failed to calculate SKey: %d", ret);
                         continue;
                    }

                    // Convert SKey to int
                    if ((ret = mbedtls_mpi_write_binary(&SKey_mpi, (unsigned char *)&keys->SKey, sizeof(keys->SKey))) != 0)
                    {
                         ESP_LOGE(TAG, "Failed to write SKey to binary: %d", ret);
                         continue;
                    }

                    // Save key to NVS
                    nvs_open("storage", NVS_READWRITE, &nvs_handle);
                    nvs_set_str(nvs_handle, "apiKey", apiKey);
                    nvs_set_i64(nvs_handle, "secretKey", keys->SKey);
                    nvs_commit(nvs_handle);
                    nvs_close(nvs_handle);
               }
               else
               {
                    ESP_LOGE(TAG, "HTTP POST request failed: %s", esp_err_to_name(ret));
                    ESP_LOGI(TAG, "Retrying...");
                    vTaskDelay(pdMS_TO_TICKS(300));
               }
          } while (ret != ESP_OK || (maxRetry--) > 0);
     }
}
