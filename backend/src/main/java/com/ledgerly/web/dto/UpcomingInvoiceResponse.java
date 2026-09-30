package com.ledgerly.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record UpcomingInvoiceResponse(
        UUID id,
        String number,
        String clientName,
        LocalDate dueDate,
        BigDecimal grossTotal) {}
