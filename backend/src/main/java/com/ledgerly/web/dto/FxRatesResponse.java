package com.ledgerly.web.dto;

import java.util.Map;

public record FxRatesResponse(String base, String date, Map<String, Double> rates) {}
