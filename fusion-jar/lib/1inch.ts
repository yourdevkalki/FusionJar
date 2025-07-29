const INCH_API_BASE = "https://api.1inch.dev";

export class OneInchAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getQuote(params: {
    src: string;
    dst: string;
    amount: string;
    from: string;
    chainId: number;
  }) {
    const response = await fetch(
      `${INCH_API_BASE}/swap/v6.0/${params.chainId}/quote?${new URLSearchParams(
        {
          src: params.src,
          dst: params.dst,
          amount: params.amount,
          from: params.from,
        }
      )}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
      }
    );
    return response.json();
  }

  async createIntent(params: {
    src: string;
    dst: string;
    amount: string;
    from: string;
    chainId: number;
    permit?: string;
  }) {
    const response = await fetch(`${INCH_API_BASE}/fusion/intents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    return response.json();
  }
}

export const oneInchAPI = new OneInchAPI(process.env.INCH_API_KEY!);
