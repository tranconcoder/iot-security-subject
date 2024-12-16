#include "setup_diffie_hellman.h"

const uint16_t MAX_HTTP_OUTPUT_BUFFER = 2048;
const char *TAG_DIFFIE_HELLMAN = "setup_diffie_hellman";
const char *HEADER_API_KEY = "X-API-KEY";

key_struct *keys = NULL;
nvs_handle_t my_nvs_handle;
char *apiKey;
uint64_t *secretKey;
bool run_websocket = false;
TaskHandle_t *pv_update_key = NULL;
TaskHandle_t *pv_get_new_key_from_server = NULL;
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
     cJSON_AddNumberToObject(json, "SKey", *(keys->SKey));

     char *json_str = cJSON_PrintUnformatted(json);
     cJSON_Delete(json);

     return json_str;
}

// Generate default key in client side
void generateKey()
{
     int ret = 1;
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
               ESP_LOGE(TAG_DIFFIE_HELLMAN, "Failed to set MPI values: %d", ret);
               goto cleanup_generate_key;
          }

          // Calculate AKey = gKey^aKey % pKey
          if ((ret = mbedtls_mpi_exp_mod(&AKey_mpi, &gKey_mpi, &aKey_mpi, &pKey_mpi, NULL)) != ESP_OK)
          {
               ESP_LOGE(TAG_DIFFIE_HELLMAN, "Failed to calculate exp mod: %d", ret);
               goto cleanup_generate_key;
          }
          char output[30];
          uint64_t olen;
          if ((ret = mbedtls_mpi_write_string(&AKey_mpi, 10, output, sizeof(output), &olen)) != ESP_OK)
          {
               ESP_LOGE(TAG_DIFFIE_HELLMAN, "Failed to write AKey to binary: %d", ret);
               goto cleanup_generate_key;
          }
          keys->AKey = atoi(output);

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
                              ESP_LOGE(TAG_DIFFIE_HELLMAN, "Failed to allocate memory for output buffer");
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
               sprintf(apiKey, "%s", evt->header_value);
               ESP_LOGI(TAG_DIFFIE_HELLMAN, "apiKey: %s", apiKey);
          }

          break;

     case HTTP_EVENT_ON_FINISH:
          ESP_LOGD(TAG_DIFFIE_HELLMAN, "HTTP_EVENT_ON_FINISH");
          if (output_buffer != NULL)
          {
               // Remove double slash from the response
               keys->BKey = atoi(output_buffer);

               ESP_LOGI(TAG_DIFFIE_HELLMAN, "BKey: %llu", keys->BKey);

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
     size_t required_size_api_key;
     esp_err_t ret = nvs_flash_init();

     if ((ret = nvs_open("storage", NVS_READWRITE, &my_nvs_handle)) != ESP_OK)
     {
          ESP_LOGE(TAG_DIFFIE_HELLMAN, "Error (%s) opening NVS handle", esp_err_to_name(ret));
          return ret;
     }

     if ((ret = nvs_get_str(my_nvs_handle, "apiKey", NULL, &required_size_api_key)) != ESP_OK)
     {
          ESP_LOGE(TAG_DIFFIE_HELLMAN, "Error get size of apiKey: %s", esp_err_to_name(ret));
          goto load_key_fail;
     }

     if ((ret = nvs_get_str(my_nvs_handle, "apiKey", apiKey, &required_size_api_key)) != ESP_OK)
     {
          ESP_LOGE(TAG_DIFFIE_HELLMAN, "Error get content of apiKey: %s", esp_err_to_name(ret));
          goto load_key_fail;
     }

     ESP_LOGI(TAG_DIFFIE_HELLMAN, "apiKey in nvs: %s", apiKey);

     if ((ret = nvs_get_u64(my_nvs_handle, "secretKey", keys->SKey)) != ESP_OK)
     {
          ESP_LOGE(TAG_DIFFIE_HELLMAN, "Error get content of secretKey: %s", esp_err_to_name(ret));
          goto load_key_fail;
     }
     ESP_LOGI(TAG_DIFFIE_HELLMAN, "secretKey in nvs: %llu", *(keys->SKey));

load_key_fail:
     nvs_close(my_nvs_handle);

     return ret;
}

bool is_api_valid()
{
     esp_err_t ret;
     bool result = false;

     esp_http_client_config_t config = {
         .host = CONFIG_WEBSERVER_IP,
         .port = CONFIG_WEBSERVER_PORT,
         .path = "/api/aes/check-api-key",
         .method = HTTP_METHOD_PUT,
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
          esp_http_client_set_header(client, HEADER_API_KEY, apiKey);
          esp_http_client_set_header(client, "User-Agent", "ESP32-CAM-SECURITY-GATE");
          ret = esp_http_client_perform(client);

          if (ret == ESP_OK)
          {
               uint16_t code = esp_http_client_get_status_code(client);

               ESP_LOGI(TAG_DIFFIE_HELLMAN, "HTTP PUT Status = %d, content_length = %llu",
                        code,
                        esp_http_client_get_content_length(client));

               result = code == 200;
          }
          else
          {
               ESP_LOGE(TAG_DIFFIE_HELLMAN, "HTTP PUT request failed: %s", esp_err_to_name(ret));
               ESP_LOGI(TAG_DIFFIE_HELLMAN, "Retrying...");
               vTaskDelay(pdMS_TO_TICKS(300));
          }

          // Cleanup
          esp_http_client_cleanup(client);
     } while ((maxRetry--) > 0 && ret != ESP_OK);

     return result;
}

void get_new_key_from_server()
{
     // Config HTTP client URI
     char *url = heap_caps_malloc(100, MALLOC_CAP_SPIRAM);
     sprintf(url, "http://%s:%d/api/aes/init", CONFIG_SERVER_IP, CONFIG_SERVER_PORT);

     esp_http_client_config_t config = {
         .host = CONFIG_WEBSERVER_IP,
         .port = CONFIG_WEBSERVER_PORT,
         .path = "/api/aes/init",
         .event_handler = handle_http_event_new_key,
         .keep_alive_enable = true,
         .method = HTTP_METHOD_POST,
     };

     // Generate new client key
     generateKey(); // Save key on "keys" variable

     uint8_t maxRetry = 0;
     esp_err_t ret;
     do
     {
          esp_http_client_handle_t client = esp_http_client_init(&config);
          uint64_t aKey = keys->aKey;

          // Remove SKey and aKey before Sending
          keys->aKey = 0;
          *(keys->SKey) = 0;

          char *payload = to_json(keys);
          size_t payload_len = strlen(payload);

          // Restore aKey
          keys->aKey = aKey;

          ESP_LOGI(TAG_DIFFIE_HELLMAN, "Sending new key to server...");
          ESP_LOGI(TAG_DIFFIE_HELLMAN, "API Key: %s %d", payload, payload_len);

          esp_http_client_set_header(client, "Content-Type", "application/json");
          esp_http_client_set_post_field(client, payload, payload_len);
          ret = esp_http_client_perform(client);

          if (ret == ESP_OK)
          {
               ESP_LOGI(TAG_DIFFIE_HELLMAN, "HTTP POST Status = %d, content_length = %llu",
                        esp_http_client_get_status_code(client),
                        esp_http_client_get_content_length(client));
               ESP_LOGI(TAG_DIFFIE_HELLMAN, "Generate SKey...");

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
                    ESP_LOGE(TAG_DIFFIE_HELLMAN, "Failed to set MPI values: %d", ret);
                    goto cleanup_get_new_key;
               }

               // Calculate SKey = BKey^aKey % pKey
               if ((ret = mbedtls_mpi_exp_mod(&SKey_mpi, &BKey_mpi, &aKey_mpi, &pKey_mpi, NULL)) != 0)
               {
                    ESP_LOGE(TAG_DIFFIE_HELLMAN, "Failed to calculate SKey: %d", ret);
                    goto cleanup_get_new_key;
               }

               // Convert SKey to int
               char output[30];
               uint64_t olen;
               if ((ret = mbedtls_mpi_write_string(&SKey_mpi, 10, output, sizeof(output), &olen)) != ESP_OK)
               {
                    ESP_LOGE(TAG_DIFFIE_HELLMAN, "Failed to write SKey to binary: %d", ret);
                    goto cleanup_get_new_key;
               }
               *keys->SKey = atoi(output);

               // Save key to NVS
               nvs_open("storage", NVS_READWRITE, &my_nvs_handle);
               nvs_set_str(my_nvs_handle, "apiKey", apiKey);
               nvs_set_u64(my_nvs_handle, "secretKey", *(keys->SKey));
               nvs_commit(my_nvs_handle);
               nvs_close(my_nvs_handle);

               ESP_LOGI(TAG_DIFFIE_HELLMAN, "New SKey : %llu", *keys->SKey);
               ESP_LOGI(TAG_DIFFIE_HELLMAN, "New ApiKey: %s", apiKey);

          cleanup_get_new_key:
               mbedtls_mpi_free(&BKey_mpi);
               mbedtls_mpi_free(&SKey_mpi);
               mbedtls_mpi_free(&aKey_mpi);
               mbedtls_mpi_free(&pKey_mpi);

               heap_caps_free(payload);
          }
          else
          {
               ESP_LOGE(TAG_DIFFIE_HELLMAN, "HTTP POST request failed: %s", esp_err_to_name(ret));
               ESP_LOGI(TAG_DIFFIE_HELLMAN, "Retrying...");
               vTaskDelay(pdMS_TO_TICKS(300));
          }

          esp_http_client_cleanup(client);
     } while (ret != ESP_OK || (maxRetry--) > 0);

     run_websocket = true;
}

// Function to handle update secretKey and apiKey interval 10 minutes
void handle_task_update_key()
{
     while (true)
     {
          vTaskDelay(pdMS_TO_TICKS(10000));
          ESP_LOGI(TAG_DIFFIE_HELLMAN, "Updating key...");

          generateKey();
          get_new_key_from_server(true);
     }
}

void setup_diffie_hellman()
{
     // Load key from NVS
     apiKey = malloc(100);
     keys = malloc(sizeof(key_struct));
     keys->SKey = malloc(sizeof(uint64_t));
     esp_err_t ret = load_key_from_nvs();

     // Found apiKey ==> check if it's valid
     bool apiKeyValid = false;
     if (ret == ESP_OK)
     {
          ESP_LOGI(TAG_DIFFIE_HELLMAN, "apiKey found in NVS: %s", apiKey);
          ESP_LOGI(TAG_DIFFIE_HELLMAN, "checking apiKey is valid...");
          apiKeyValid = is_api_valid();
     }

     // Not found apiKey ==> Get new apiKey
     if (ret != ESP_OK || !apiKeyValid)
     {
          ESP_LOGI(TAG_DIFFIE_HELLMAN, "Key not found or invalid, getting new apiKey...");
          get_new_key_from_server();
     }
     else
     {
          run_websocket = true;
     }

     while (!run_websocket)
     {
          vTaskDelay(pdMS_TO_TICKS(100));
     }
     xTaskCreate(handle_task_update_key, "task_update_key", 4096, NULL, 5, NULL);
     ESP_LOGI(TAG_DIFFIE_HELLMAN, "Complete init AES Key, starting websocket client...");
     setup_esp_websocket_client_init(apiKey, keys->SKey);
}
