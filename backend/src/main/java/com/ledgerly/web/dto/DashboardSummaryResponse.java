package com.ledgerly.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record DashboardSummaryResponse(
        LocalDate fromDate,
        LocalDate toDate,
        BigDecimal issuedGross,
        BigDecimal paidGross,
        BigDecimal outstandingGross,
        List<UpcomingInvoiceResponse> upcomingDue) {}
