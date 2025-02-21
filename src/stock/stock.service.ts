import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface StockAnalysisResponse {
  isUSStock: boolean;
  symbol?: string;
  companyName?: string;
  bio?: string;
  logo?: string;
  error?: string;
}

@Injectable()
export class StockService {
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async analyzeStockQuery(searchText: string): Promise<StockAnalysisResponse> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `Analyze the following text and determine if it's referring to a company listed on US stock exchanges. The text could be either a company name or a stock symbol. If it matches a stock symbol pattern (usually 1-5 uppercase letters) or refers to a company, provide the stock information. Return a clean JSON object (without markdown formatting) with the following structure: {"isUSStock": boolean, "symbol": string?, "companyName": string?, "bio": string?, "logo": string?}. If it's a company, include a concise 140-character biography describing the company's main business and significance. For the logo, use the format https://eodhd.com/img/logos/US/{symbol}.png where {symbol} is the stock symbol.\n\nText: ${searchText}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      const cleanJson = text.replace(/^```json\s*|\s*```$/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      return {
        isUSStock: false,
        error: 'Failed to analyze the query'
      };
    }
  }
}