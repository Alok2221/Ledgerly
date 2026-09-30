package com.ledgerly.web;

import com.ledgerly.service.FxRateService;
import com.ledgerly.web.dto.FxRatesResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rates")
public class RatesController {

    private final FxRateService fxRateService;

    public RatesController(FxRateService fxRateService) {
        this.fxRateService = fxRateService;
    }

    @GetMapping
    public FxRatesResponse latest() {
        return fxRateService.latestFromPln();
    }
}
