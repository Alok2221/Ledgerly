package com.ledgerly.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record InvoiceItemResponse(
        UUID id,
        String description,
        BigDecimal quantity,
        BigDecimal unitNetPrice,
        BigDecimal vatRate,
        BigDecimal lineNet,
        BigDecimal lineVat,
        BigDecimal lineGross) {}
