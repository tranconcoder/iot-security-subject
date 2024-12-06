#include "setup_spi.h"

#define GPIO_HANDSHAKE 2
#define GPIO_MOSI 12
#define GPIO_MISO 13
#define GPIO_SCLK 15
#define GPIO_CS 14
#define SENDER_HOST HSPI_HOST

static const char *SETUP_SPI_TAG = "SPI_SETUP";
static QueueHandle_t rdySem;

static void IRAM_ATTR gpio_handshake_isr_handler(void *arg)
{
    // Sometimes due to interference or ringing or something, we get two irqs after eachother. This is solved by
    // looking at the time between interrupts and refusing any interrupt too close to another one.
    static uint32_t lasthandshaketime_us;
    uint32_t currtime_us = esp_timer_get_time();
    uint32_t diff = currtime_us - lasthandshaketime_us;
    if (diff < 1000)
    {
        return; // ignore everything <1ms after an earlier irq
    }
    lasthandshaketime_us = currtime_us;

    // Give the semaphore.
    BaseType_t mustYield = false;
    xSemaphoreGiveFromISR(rdySem, &mustYield);
    if (mustYield)
    {
        portYIELD_FROM_ISR();
    }
}

void setup_spi()
{
    esp_err_t ret;
    spi_device_handle_t handle;

    // Configuration for the SPI bus
    spi_bus_config_t buscfg = {
        .max_transfer_sz = 300000,
        .mosi_io_num = GPIO_MOSI,
        .miso_io_num = GPIO_MISO,
        .sclk_io_num = GPIO_SCLK,
        .quadwp_io_num = -1,
        .quadhd_io_num = -1};

    // Configuration for the SPI device on the other side of the bus
    spi_device_interface_config_t devcfg = {
        .mode = 1,
        .command_bits = 0,
        .address_bits = 0,
        .dummy_bits = 0,
        .clock_speed_hz = 5000000,
        .duty_cycle_pos = 128, // 50% duty cycle
        .spics_io_num = GPIO_CS,
        .cs_ena_posttrans = 3, // Keep the CS low 3 cycles after transaction, to stop slave from missing the last bit when CS has less propagation delay than CLK
        .queue_size = 3};

    // GPIO config for the handshake line.
    gpio_config_t io_conf = {
        .intr_type = GPIO_INTR_POSEDGE,
        .mode = GPIO_MODE_INPUT,
        .pull_up_en = 1,
        .pin_bit_mask = (1 << GPIO_HANDSHAKE)};

    int n = 0;
    spi_transaction_t t;
    memset(&t, 0, sizeof(t));

    // Create the semaphore.
    rdySem = xSemaphoreCreateBinary();

    // Set up handshake line interrupt.
    gpio_config(&io_conf);
    gpio_install_isr_service(0);
    gpio_set_intr_type(GPIO_HANDSHAKE, GPIO_INTR_POSEDGE);
    gpio_isr_handler_add(GPIO_HANDSHAKE, gpio_handshake_isr_handler, NULL);

    // Initialize the SPI bus and add the device we want to send stuff to.
    ret = spi_bus_initialize(SENDER_HOST, &buscfg, SPI_DMA_CH_AUTO);
    assert(ret == ESP_OK);
    ret = spi_bus_add_device(SENDER_HOST, &devcfg, &handle);
    assert(ret == ESP_OK);

    // Assume the slave is ready for the first transmission: if the slave started up before us, we will not detect
    // positive edge on the handshake line.
    xSemaphoreGive(rdySem);

    const int SIZE = 20000;

    while (true)
    {
        camera_fb_t *fb = esp_camera_fb_get();

        t.length = SIZE * 8;
        t.tx_buffer = (char *)fb->buf;
        t.rx_buffer = NULL;

        // xSemaphoreTake(rdySem, pdMS_TO_TICKS(100));
        ret = spi_device_transmit(handle, &t);

        printf("Sending size = %d\n", t.length);

        esp_camera_fb_return(fb);
    }

    // Never reached.
    ret = spi_bus_remove_device(handle);
    assert(ret == ESP_OK);
}
