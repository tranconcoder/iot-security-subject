#include "setup_diffie_hellman.h"

const uint16_t MAX_HTTP_OUTPUT_BUFFER = 2048;
const char *TAG = "setup_diffie_hellman";
const char *HEADER_API_KEY = "X-API-KEY";

typedef struct
{
     uint64_t aKey;
     uint64_t pKey;
     uint64_t gKey;
     uint64_t AKey;
     uint64_t BKey;
     uint64_t SKey;
} key_struct;

key_struct *keys = NULL;
nvs_handle_t my_nvs_handle;

char *to_json(key_struct *keys)
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

     cJSON_AddNumberToObject(json, "aKey", keys->aKey);
     cJSON_AddNumberToObject(json, "pKey", keys->pKey);
     cJSON_AddNumberToObject(json, "gKey", keys->gKey);
     cJSON_AddNumberToObject(json, "AKey", keys->AKey);
     cJSON_AddNumberToObject(json, "BKey", keys->BKey);
     cJSON_AddNumberToObject(json, "SKey", keys->SKey);

     char *json_str = cJSON_PrintUnformatted(json);
     cJSON_Delete(json);

     return json_str;
}

static char *apiKey;

// Generate default key in client side
void generateKey()
{
     int ret = 1;
     keys = malloc(sizeof(key_struct));
     mbedtls_mpi pKey_mpi, gKey_mpi, aKey_mpi, AKey_mpi;

     while (ret)
     {
          keys->gKey = esp_random() % UINT8_MAX;                   // gKey: 0 -> 100
          keys->pKey = MIN(keys->gKey + esp_random(), UINT32_MAX); // pKey: gKey -> 2^32
          keys->aKey = esp_random() % keys->pKey;                  // aKey: 1 -> pKey

          // Calculate AKey
          mbedtls_mpi_init(&pKey_mpi);
          mbedtls_mpi_init(&gKey_mpi);
          mbedtls_mpi_init(&aKey_mpi);
          mbedtls_mpi_init(&AKey_mpi);

          if ((ret = mbedtls_mpi_lset(&pKey_mpi, keys->pKey)) != 0 ||
              (ret = mbedtls_mpi_lset(&gKey_mpi, keys->gKey)) != 0 ||
              (ret = mbedtls_mpi_lset(&aKey_mpi, keys->aKey)) != 0)
          {
               ESP_LOGE(TAG, "Failed to set MPI values: %d", ret);
               goto cleanup_generate_key;
          }

          // Calculate AKey = gKey^aKey % pKey
          if ((ret = mbedtls_mpi_exp_mod(&AKey_mpi, &gKey_mpi, &aKey_mpi, &pKey_mpi, NULL)) != 0)
          {
               ESP_LOGE(TAG, "Failed to calculate exp mod: %d", ret);
               goto cleanup_generate_key;
          }
          if ((ret = mbedtls_mpi_write_binary(&AKey_mpi, (unsigned char *)&keys->AKey, sizeof(keys->AKey))) != 0)
          {
               ESP_LOGE(TAG, "Failed to write AKey to binary: %d", ret);
               goto cleanup_generate_key;
          }

     cleanup_generate_key:
          mbedtls_mpi_free(&pKey_mpi);
          mbedtls_mpi_free(&gKey_mpi);
          mbedtls_mpi_free(&aKey_mpi);
          mbedtls_mpi_free(&AKey_mpi);
     }
}

void handle_http_event_new_key(esp_http_client_event_t *evt)
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
                              return;
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

     default:
     }
}

esp_err_t load_key_from_nvs()
{
     // Load NVS
     esp_err_t ret = nvs_open("storage", NVS_READONLY, &my_nvs_handle);

     if (ret == ESP_OK)
     {
          size_t required_size_api_key;
          nvs_get_str(my_nvs_handle, "apiKey", NULL, &required_size_api_key);

          apiKey = malloc(required_size_api_key);

          nvs_get_str(my_nvs_handle, "apiKey", apiKey, &required_size_api_key);
          nvs_get_u64(my_nvs_handle, "secretKey", &keys->SKey);

          nvs_close(my_nvs_handle);
     }

     return ret;
}

bool is_api_valid()
{
     esp_err_t ret;
     bool result = false;

     // Config HTTP client URI
     char *url = heap_caps_malloc(100, MALLOC_CAP_SPIRAM);
     sprintf(url, "http://%s:%d/api/aes/check-api-key", CONFIG_SERVER_IP, CONFIG_SERVER_PORT);

     esp_http_client_config_t config = {
         .url = url,
         .event_handler = print_http_event,
         .timeout_ms = 3000,
         .keep_alive_enable = true,
     };

     // Handle HTTP request
     int maxRetry = 3;
     esp_http_client_handle_t client;
     do
     {
          client = esp_http_client_init(&config);
          esp_http_client_set_method(client, HTTP_METHOD_PUT);
          esp_http_client_set_header(client, HEADER_API_KEY, apiKey);

          ret = esp_http_client_perform(client);
          if (ret == ESP_OK)
          {
               uint16_t code = esp_http_client_get_status_code(client);

               ESP_LOGI(TAG, "HTTP PUT Status = %d, content_length = %llu",
                        code,
                        esp_http_client_get_content_length(client));

               result = code == 200;
          }
          else
          {
               ESP_LOGE(TAG, "HTTP PUT request failed: %s", esp_err_to_name(ret));
               ESP_LOGI(TAG, "Retrying...");
               vTaskDelay(pdMS_TO_TICKS(300));
          }
     } while ((maxRetry--) > 0 && ret != ESP_OK);

     // Cleanup
     free(url);
     esp_http_client_cleanup(client);

     return result;
}

void get_new_key_from_server()
{
     // Config HTTP client URI
     char *url = heap_caps_malloc(100, MALLOC_CAP_SPIRAM);
     sprintf(url, "http://%s:%d/api/aes/init", CONFIG_SERVER_IP, CONFIG_SERVER_PORT);

     esp_http_client_config_t config = {
         .url = url,
         .event_handler = handle_http_event_new_key,
         .timeout_ms = 3000,
         .keep_alive_enable = true,
     };

     // Generate new client key
     generateKey(); // Save key on "keys" variable

     uint8_t maxRetry = 3;
     esp_err_t ret;
     do
     {
          ESP_LOGI(TAG, "Sending new key to server...");

          esp_http_client_handle_t client = esp_http_client_init(&config);

          esp_http_client_set_method(client, HTTP_METHOD_POST);
          // Remove SKey and aKey before Sending
          uint64_t aKey = keys->aKey;
          keys->aKey = 0;
          keys->SKey = 0;
          esp_http_client_set_post_field(client, to_json(keys), strlen(to_json(keys)));
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
                    goto cleanup_get_new_key;
               }

               // Calculate SKey = BKey^aKey % pKey
               if ((ret = mbedtls_mpi_exp_mod(&SKey_mpi, &BKey_mpi, &aKey_mpi, &pKey_mpi, NULL)) != 0)
               {
                    ESP_LOGE(TAG, "Failed to calculate SKey: %d", ret);
                    goto cleanup_get_new_key;
               }

               // Convert SKey to int
               if ((ret = mbedtls_mpi_write_binary(&SKey_mpi, (unsigned char *)&keys->SKey, sizeof(keys->SKey))) != 0)
               {
                    ESP_LOGE(TAG, "Failed to write SKey to binary: %d", ret);
                    goto cleanup_get_new_key;
               }

               // Save key to NVS
               nvs_open("storage", NVS_READWRITE, &my_nvs_handle);
               nvs_set_str(my_nvs_handle, "apiKey", apiKey);
               nvs_set_i64(my_nvs_handle, "secretKey", keys->SKey);
               nvs_commit(my_nvs_handle);
               nvs_close(my_nvs_handle);

          cleanup_get_new_key:
               mbedtls_mpi_free(&BKey_mpi);
               mbedtls_mpi_free(&SKey_mpi);
               mbedtls_mpi_free(&aKey_mpi);
               mbedtls_mpi_free(&pKey_mpi);
          }
          else
          {
               ESP_LOGE(TAG, "HTTP POST request failed: %s", esp_err_to_name(ret));
               ESP_LOGI(TAG, "Retrying...");
               vTaskDelay(pdMS_TO_TICKS(300));
          }
     } while (ret != ESP_OK || (maxRetry--) > 0);
}

// Function to handle update secretKey and apiKey interval 10 minutes
void handle_task_update_key()
{
     while (true)
     {
          // Update key every 10 minutes
          vTaskDelay(pdMS_TO_TICKS(600000));

          generateKey();
          get_new_key_from_server();
     }
}

uint64_t getSecretKey()
{
     return keys->SKey;
}

uint64_t getApiKey()
{
     return apiKey;
}

void setup_diffie_hellman()
{
     // Load key from NVS
     esp_err_t ret = load_key_from_nvs();

     // Found apiKey ==> check if it's valid
     bool apiKeyValid = false;
     if (ret == ESP_OK)
     {
          ESP_LOGI(TAG, "apiKey found in NVS, checking apiKey is valid...");
          apiKeyValid = is_api_valid();
     }

     // Not found apiKey ==> Get new apiKey
     if (ret != ESP_OK || !apiKeyValid)
     {
          ESP_LOGI(TAG, "Key not found or invalid, getting new apiKey...");
          get_new_key_from_server();
     }

     xTaskCreate(handle_task_update_key, "task_update_key", 4096, NULL, 5, NULL);
}