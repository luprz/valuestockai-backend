import { Controller, Post, Body } from '@nestjs/common';
import { StockService } from './stock.service';

interface StockQueryDto {
  searchText: string;
}

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post('search')
  async analyzeStock(@Body() query: StockQueryDto) {
    return this.stockService.analyzeStockQuery(query.searchText);
  }
}