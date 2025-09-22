import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
import { activityService } from "@/services/api/activityService";
import { eachMonthOfInterval, endOfMonth, format, parseISO, startOfMonth, subMonths } from "date-fns";
import React from "react";
import Error from "@/components/ui/Error";
import { getAll } from "@/services/api/companiesService";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ReportsService {
  async getAnalytics(timeframe = '6months') {
    await delay(500);
    
    try {
      // Get data from services
      const [contacts, deals, activities] = await Promise.all([
        contactService.getAll(),
        dealService.getAll(),
        activityService.getAll()
      ]);

      // Calculate timeframe
      const monthsToInclude = timeframe === '3months' ? 3 : timeframe === '12months' ? 12 : 6;
      const endDate = new Date();
      const startDate = subMonths(endDate, monthsToInclude - 1);
      const months = eachMonthOfInterval({ start: startOfMonth(startDate), end: endOfMonth(endDate) });

      // Calculate metrics
      const conversionData = this.calculateConversionRate(deals, months);
      const leadGenData = this.calculateLeadGeneration(contacts, deals, months);
      const customerAcquisitionCost = this.calculateCustomerAcquisitionCost(deals, contacts);
      const pipelineAnalysis = this.calculatePipelineAnalysis(deals);
      const revenueMetrics = this.calculateRevenueMetrics(deals, months);

      return {
        conversionRate: conversionData,
        conversionTrend: conversionData.monthly,
        leadGeneration: leadGenData,
        customerAcquisitionCost,
        pipelineAnalysis,
        revenueMetrics
      };
    } catch (error) {
      console.error('Error calculating analytics:', error);
      throw new Error('Failed to calculate analytics data');
    }
  }

  calculateConversionRate(deals, months) {
    const monthlyData = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      // Filter deals for this month using database field names
      const monthDeals = deals.filter(deal => {
        if (!deal.CreatedAt) return false;
        const dealDate = parseISO(deal.CreatedAt);
        return dealDate >= monthStart && dealDate <= monthEnd;
      });
      
      const totalDeals = monthDeals.length;
      const wonDeals = monthDeals.filter(deal => deal.Stage === 'closed-won').length;
      const rate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;
      
      return {
        month: format(month, 'yyyy-MM-dd'),
        rate: parseFloat(rate.toFixed(1))
      };
    });
    
    const currentRate = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].rate : 0;
    const previousRate = monthlyData.length > 1 ? monthlyData[monthlyData.length - 2].rate : 0;
    const trend = currentRate - previousRate;
    
    return {
      current: currentRate,
      trend,
      monthly: monthlyData
    };
  }

  calculateLeadGeneration(contacts, deals, months) {
    const monthlyData = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      // Filter contacts for this month using database field names
      const monthContacts = contacts.filter(contact => {
        if (!contact.CreatedAt) return false;
        const contactDate = parseISO(contact.CreatedAt);
        return contactDate >= monthStart && contactDate <= monthEnd;
      });
      
      // Qualified leads are contacts with associated deals
      const qualifiedLeads = contacts.filter(contact => {
        if (!contact.CreatedAt) return false;
        const contactDate = parseISO(contact.CreatedAt);
        const hasDeals = deals.some(deal => deal.ContactId?.Id === contact.Id);
        return contactDate >= monthStart && contactDate <= monthEnd && hasDeals;
      }).length;
      
      return {
        month: format(month, 'yyyy-MM-dd'),
        newLeads: monthContacts.length,
        qualifiedLeads
      };
    });
    
    const totalNewLeads = monthlyData.reduce((sum, month) => sum + month.newLeads, 0);
    const averageLeads = Math.round(totalNewLeads / months.length);
    
    // Calculate trend
    const recent = monthlyData.slice(-2);
    const trend = recent.length === 2 ? 
      ((recent[1].newLeads - recent[0].newLeads) / recent[0].newLeads * 100) : 0;
    
    return {
      monthlyAverage: averageLeads,
      trend: parseFloat(trend.toFixed(1)),
      monthly: monthlyData
    };
  }

  calculateCustomerAcquisitionCost(deals, contacts) {
    // Calculate CAC based on deal values using database field names
    const wonDeals = deals.filter(deal => deal.Stage === 'closed-won');
    
    if (wonDeals.length === 0) {
      return {
        average: 0,
        lowest: 0,
        highest: 0,
        trend: 0
      };
    }
    
    const cacValues = wonDeals.map(deal => {
      // Simulate CAC calculation based on deal value
      const baseCac = Math.max(500, Math.min(5000, 10000 - (deal.Amount * 0.1)));
      return Math.round(baseCac + (Math.random() * 1000 - 500)); // Add some variance
    });
    
    const average = Math.round(cacValues.reduce((sum, cac) => sum + cac, 0) / cacValues.length);
    const lowest = Math.min(...cacValues);
    const highest = Math.max(...cacValues);
    
    // Calculate trend (simulate based on recent performance)
    const recentCacs = cacValues.slice(-Math.min(5, cacValues.length));
    const olderCacs = cacValues.slice(0, Math.max(1, cacValues.length - 5));
    
    const recentAvg = recentCacs.reduce((sum, cac) => sum + cac, 0) / recentCacs.length;
    const olderAvg = olderCacs.reduce((sum, cac) => sum + cac, 0) / olderCacs.length;
    const trend = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg * 100) : 0;
    
    return {
      average,
      lowest,
      highest,
      trend: parseFloat(trend.toFixed(1))
    };
  }

  calculatePipelineAnalysis(deals) {
    // Group deals by stage, excluding closed-lost using database field names
    const stageGroups = deals.reduce((acc, deal) => {
      if (deal.Stage !== 'closed-lost') {
        if (!acc[deal.Stage]) {
          acc[deal.Stage] = { count: 0, value: 0 };
        }
        acc[deal.Stage].count++;
        acc[deal.Stage].value += deal.Amount;
      }
      return acc;
    }, {});
    
    const byStage = Object.entries(stageGroups).map(([stage, data]) => ({
      stage,
      count: data.count,
      value: data.value
    }));
    
    const totalValue = byStage.reduce((sum, stage) => sum + stage.value, 0);
    const activeDeals = byStage.reduce((sum, stage) => sum + stage.count, 0);
    
    return {
      byStage,
      totalValue,
      activeDeals
    };
  }

  calculateRevenueMetrics(deals, months) {
    // Calculate monthly revenue from closed-won deals using database field names
    const wonDeals = deals.filter(deal => deal.Stage === 'closed-won');
    
    const monthlyData = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthRevenue = wonDeals.reduce((sum, deal) => {
        if (!deal.ExpectedCloseDate) return sum;
        const closedDate = parseISO(deal.ExpectedCloseDate);
        if (closedDate >= monthStart && closedDate <= monthEnd) {
          return sum + deal.Amount;
        }
        return sum;
      }, 0);
      
      return {
        month: format(month, 'yyyy-MM-dd'),
        revenue: monthRevenue
      };
    });
    
    const totalRevenue = monthlyData.reduce((sum, month) => sum + month.revenue, 0);
    const averageMonthlyRevenue = totalRevenue / months.length;
    
    return {
      monthly: monthlyData,
      total: totalRevenue,
      averageMonthly: Math.round(averageMonthlyRevenue)
    };
  }
}

export const reportsService = new ReportsService();