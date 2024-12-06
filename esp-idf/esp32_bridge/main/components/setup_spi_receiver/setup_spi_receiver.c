#include "setup_spi_receiver.h"

// Called after a transaction is queued and ready for pickup by master. We use this to set the handshake line high.
void my_post_setup_cb(spi_slave_transaction_t *trans)
{
    gpio_set_level(GPIO_HANDSHAKE, 1);
}

// Called after transaction is sent/received. We use this to set the handshake line low.
void my_post_trans_cb(spi_slave_transaction_t *trans)
{
    gpio_set_level(GPIO_HANDSHAKE, 0);
}

void handle_receive_spi(esp_websocket_client_handle_t ws_client)
{
    esp_err_t ret;

    // Configuration for the SPI bus
    spi_bus_config_t buscfg = {
        .max_transfer_sz = 300000,
        .mosi_io_num = GPIO_MOSI,
        .miso_io_num = GPIO_MISO,
        .sclk_io_num = GPIO_SCLK,
        .quadwp_io_num = -1,
        .quadhd_io_num = -1,
    };

    // Configuration for the SPI slave interface
    spi_slave_interface_config_t slvcfg = {
        .mode = 2,
        .spics_io_num = GPIO_CS,
        .queue_size = 3,
        .flags = 0,
        .post_setup_cb = my_post_setup_cb,
        .post_trans_cb = my_post_trans_cb};

    // Configuration for the handshake line
    gpio_config_t io_conf = {
        .intr_type = GPIO_INTR_DISABLE,
        .mode = GPIO_MODE_OUTPUT,
        .pin_bit_mask = (1 << GPIO_HANDSHAKE)};

    // Configure handshake line as output
    gpio_config(&io_conf);
    // Enable pull-ups on SPI lines so we don't detect rogue pulses when no master is connected.
    gpio_set_pull_mode(GPIO_MOSI, GPIO_PULLUP_ONLY);
    gpio_set_pull_mode(GPIO_SCLK, GPIO_PULLUP_ONLY);
    gpio_set_pull_mode(GPIO_CS, GPIO_PULLUP_ONLY);

    // Initialize SPI slave interface
    ret = spi_slave_initialize(RCV_HOST, &buscfg, &slvcfg, SPI_DMA_CH_AUTO);
    assert(ret == ESP_OK);

    const int CHUNK_SIZE = 20000;
    uint64_t last_send_time = esp_timer_get_time();

    spi_slave_transaction_t t;
    WORD_ALIGNED_ATTR char *data_received = malloc(CHUNK_SIZE);

    memset(&t, 0, sizeof(t));

    while (true)
    {
        t.length = CHUNK_SIZE * 8;
        t.rx_buffer = data_received;
        t.tx_buffer = NULL;

        ret = spi_slave_transmit(RCV_HOST, &t, pdMS_TO_TICKS(100));

        if (ret == ESP_OK && t.trans_len == t.length)
        {
            ESP_LOGI(SETUP_SPI_RECEIVER_TAG, "Received %d bits", t.trans_len);
            // Print the first 10 bytes of the received data
            for (int i = 10000; i < 10010; i++)
                printf("%02X ", data_received[i]);
            printf("\n");

            int send_result = esp_websocket_client_send_bin(ws_client, (char *)data_received, t.trans_len / 8, 5000 / portTICK_PERIOD_MS);

            if (send_result != -1)
            {
                uint64_t current_time = esp_timer_get_time();

                ESP_LOGI(SETUP_SPI_RECEIVER_TAG,
                         "Image sent to WebSocket: %d bytes (%.1ffps)",
                         t.trans_len,
                         1000.0 / ((current_time - last_send_time) / 1000));

                last_send_time = current_time;
            }
        }
    }
}

// Main application
void setup_spi_receiver(esp_websocket_client_handle_t ws_client)
{
    xTaskCreatePinnedToCore(handle_receive_spi,
                            "handle_send_spi",
                            4096,
                            ws_client,
                            configMAX_PRIORITIES - 1,
                            NULL,
                            tskNO_AFFINITY);
}
