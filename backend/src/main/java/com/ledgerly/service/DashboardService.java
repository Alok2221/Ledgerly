package com.ledgerly.service;

import com.ledgerly.repository.InvoiceRepository;
import com.ledgerly.web.dto.DashboardSummaryResponse;
import com.ledgerly.web.dto.UpcomingInvoiceResponse;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final InvoiceRepository invoiceRepository;

    public DashboardService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse summary(UUID ownerId, LocalDate from, LocalDate to) {
        LocalDate today = LocalDate.now();
        LocalDate rangeFrom = from != null ? from : today.withDayOfYear(1);
        LocalDate rangeTo = to != null ? to : today;

        List<UpcomingInvoiceResponse> upcoming = invoiceRepository
                .findUpcomingDue(ownerId, today, today.plusDays(14))
                .stream()
                .map(i -> new UpcomingInvoiceResponse(
                        i.getId(),
                        i.getNumber(),
                        i.getClient().getName(),
                        i.getDueDate(),
                        i.getGrossTotal()))
                .toList();

        return new DashboardSummaryResponse(
                rangeFrom,
                rangeTo,
                invoiceRepository.sumIssuedGross(ownerId, rangeFrom, rangeTo),
                invoiceRepository.sumPaidGross(ownerId, rangeFrom, rangeTo),
                invoiceRepository.sumOutstandingGross(ownerId, rangeFrom, rangeTo),
                upcoming);
    }
}
