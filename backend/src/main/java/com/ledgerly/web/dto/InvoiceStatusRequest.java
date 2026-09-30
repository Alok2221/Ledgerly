package com.ledgerly.web.dto;

import com.ledgerly.domain.InvoiceStatus;
import jakarta.validation.constraints.NotNull;

public record InvoiceStatusRequest(@NotNull InvoiceStatus status) {}
