import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Screenshot capture utility for PDF manual generation
export const captureScreenshot = async (elementId, filename = 'screenshot') => {
  try {
    const element = document.getElementById(elementId) || document.body;
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1920,
      windowHeight: 1080,
      scale: 2 // Higher quality
    });
    
    // Convert to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        resolve({ blob, url, canvas });
      }, 'image/png');
    });
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    throw error;
  }
};

// Create PDF with screenshots
export const createPDFManual = async (pages) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    
    if (i > 0) pdf.addPage();
    
    // Add title
    pdf.setFontSize(16);
    pdf.setTextColor(255, 102, 0); // Orange color
    pdf.text(page.title, 20, 20);
    
    // Add description
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const splitDescription = pdf.splitTextToSize(page.description, pageWidth - 40);
    pdf.text(splitDescription, 20, 35);
    
    // Add screenshot if available
    if (page.screenshot) {
      const imgHeight = (pageWidth - 40) * 0.6; // Maintain aspect ratio
      pdf.addImage(page.screenshot, 'PNG', 20, 60, pageWidth - 40, imgHeight);
    }
  }
  
  return pdf;
};

// Auto-capture screenshots for all major pages
export const autoCapturePagesScreenshots = async () => {
  const pages = [
    { route: '/', elementId: 'home-page', title: 'Landing Page' },
    { route: '/entrepreneur-dashboard', elementId: 'dashboard-main', title: 'Entrepreneur Dashboard' },
    { route: '/investor-dashboard', elementId: 'dashboard-main', title: 'Investor Dashboard' },
    { route: '/create-startup', elementId: 'main', title: 'Create Startup Page' },
    { route: '/messages', elementId: 'main', title: 'Messages Page' },
    { route: '/settings', elementId: 'main', title: 'Settings Page' }
  ];
  
  const screenshots = [];
  
  for (const page of pages) {
    try {
      // Navigate to page (you'd need to implement this based on your routing)
      // window.history.pushState({}, '', page.route);
      
      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Capture screenshot
      const screenshot = await captureScreenshot(page.elementId);
      screenshots.push({
        ...page,
        screenshot: screenshot.canvas.toDataURL()
      });
    } catch (error) {
      console.error(`Failed to capture ${page.title}:`, error);
    }
  }
  
  return screenshots;
};

// Download image
export const downloadImage = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};





