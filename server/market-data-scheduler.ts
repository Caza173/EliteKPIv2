import cron from 'node-cron';
import { zillowService } from './zillow-scraper';

export class MarketDataScheduler {
  private isRunning = false;

  startScheduler() {
    if (this.isRunning) return;
    
    console.log('🏠 Market Data Scheduler started');
    
    // Update market data daily at 6 AM
    cron.schedule('0 6 * * *', async () => {
      console.log('🔄 Starting scheduled market data update...');
      try {
        await zillowService.updateAllMarketData();
        console.log('✅ Market data update completed successfully');
      } catch (error) {
        console.error('❌ Error in scheduled market data update:', error);
      }
    });

    // Update popular markets every 4 hours during business hours (8 AM - 8 PM)
    cron.schedule('0 8,12,16,20 * * *', async () => {
      console.log('🔄 Starting frequent market data update for popular cities...');
      try {
        const popularCities = [
          { city: 'Manchester', state: 'NH' },
          { city: 'Boston', state: 'MA' },
          { city: 'Austin', state: 'TX' },
          { city: 'Miami', state: 'FL' }
        ];

        for (const location of popularCities) {
          try {
            await zillowService.scrapeMarketData(location.city, location.state, 'single_family');
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`Error updating ${location.city}, ${location.state}:`, error);
          }
        }
        console.log('✅ Popular markets update completed');
      } catch (error) {
        console.error('❌ Error in frequent market data update:', error);
      }
    });

    this.isRunning = true;
  }

  stopScheduler() {
    cron.getTasks().forEach(task => task.destroy());
    this.isRunning = false;
    console.log('🛑 Market Data Scheduler stopped');
  }

  async runImmediateUpdate() {
    console.log('🚀 Running immediate market data update...');
    try {
      // Update a few key markets immediately for testing
      const testCities = [
        { city: 'Manchester', state: 'NH' },
        { city: 'Boston', state: 'MA' },
        { city: 'Austin', state: 'TX' }
      ];

      for (const location of testCities) {
        console.log(`Updating ${location.city}, ${location.state}...`);
        await zillowService.scrapeMarketData(location.city, location.state, 'single_family');
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      }
      
      console.log('✅ Immediate update completed');
    } catch (error) {
      console.error('❌ Error in immediate update:', error);
    }
  }
}

export const marketDataScheduler = new MarketDataScheduler();