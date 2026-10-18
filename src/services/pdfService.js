import { jsPDF } from 'jspdf';

export const pdfService = {
  generateCV({ profile, skills = [], timeline = [], projects = [], customSummary = '' }) {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 18;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = margin;

      const checkPageBreak = (neededHeight) => {
        if (yPos + neededHeight > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
          // Re-draw subtle top accent on subsequent pages
          doc.setFillColor(141, 220, 255);
          doc.rect(margin, margin - 4, contentWidth, 0.75, 'F');
        }
      };

      // Top Accent bar
      doc.setFillColor(14, 116, 144); // Deep cyan/ice blue accent
      doc.rect(margin, yPos, contentWidth, 3, 'F');
      yPos += 8;

      // Header: Name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(11, 19, 43); // Dark navy
      doc.text(profile.name || 'Habib Ramadhan', margin, yPos);
      yPos += 6;

      // Subtitle / School & Status
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(30, 41, 59);
      const subtitle = `${profile.status || 'Siswa SMK'} • ${profile.class || 'XI PPLG 3'} • ${profile.school || 'SMK'}`;
      doc.text(subtitle, margin, yPos);
      yPos += 5;

      // Tagline
      if (profile.tagline) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`"${profile.tagline}"`, margin, yPos);
        yPos += 5;
      }

      // Contact row: Email | Phone | Location | GitHub
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const contacts = [
        profile.email,
        profile.whatsapp,
        profile.location,
        profile.github ? profile.github.replace('https://', '') : ''
      ].filter(Boolean);
      doc.text(contacts.join('   |   '), margin, yPos);
      yPos += 4;

      // Divider line
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.4);
      doc.line(margin, yPos, margin + contentWidth, yPos);
      yPos += 6;

      // Helper for Section Titles
      const renderSectionHeader = (title) => {
        checkPageBreak(12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11.5);
        doc.setTextColor(14, 116, 144);
        doc.text(title.toUpperCase(), margin, yPos);
        yPos += 2;
        doc.setDrawColor(14, 116, 144);
        doc.setLineWidth(0.6);
        doc.line(margin, yPos, margin + contentWidth, yPos);
        yPos += 5;
      };

      // 1. RINGKASAN PROFIL (Summary)
      const summaryText = customSummary || profile.bio || profile.careerGoal;
      if (summaryText) {
        renderSectionHeader('Ringkasan Profil');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        const splitBio = doc.splitTextToSize(summaryText, contentWidth);
        checkPageBreak(splitBio.length * 4.5);
        doc.text(splitBio, margin, yPos);
        yPos += (splitBio.length * 4.5) + 4;
      }

      // 2. PENDIDIKAN & PENGALAMAN (Education & Experience)
      if (timeline && timeline.length > 0) {
        renderSectionHeader('Pendidikan & Riwayat Kegiatan');
        timeline.forEach(item => {
          checkPageBreak(18);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(15, 23, 42);
          doc.text(item.institution, margin, yPos);

          const dateStr = `${item.startDate} — ${item.endDate || (item.isCurrent ? 'Sekarang' : '')}`;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(100, 116, 139);
          doc.text(dateStr, margin + contentWidth, yPos, { align: 'right' });
          yPos += 4.5;

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(30, 41, 59);
          doc.text(item.role, margin, yPos);
          yPos += 4;

          if (item.description) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(71, 85, 105);
            const descLines = doc.splitTextToSize(item.description, contentWidth);
            checkPageBreak(descLines.length * 4);
            doc.text(descLines, margin, yPos);
            yPos += (descLines.length * 4) + 2;
          }

          if (item.highlights && item.highlights.length > 0) {
            item.highlights.forEach(h => {
              checkPageBreak(4);
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(8);
              doc.setTextColor(71, 85, 105);
              doc.text(`• ${h}`, margin + 3, yPos);
              yPos += 3.8;
            });
          }
          yPos += 3;
        });
      }

      // 3. KEAHLIAN / SKILLS
      if (skills && skills.length > 0) {
        renderSectionHeader('Keahlian & Teknologi');
        checkPageBreak(15);
        
        // Group skills by category
        const categories = {};
        skills.forEach(s => {
          const cat = s.category || 'Lainnya';
          if (!categories[cat]) categories[cat] = [];
          categories[cat].push(`${s.name} (${s.proficiency}%)`);
        });

        Object.keys(categories).forEach(cat => {
          checkPageBreak(8);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
          doc.text(`${cat}: `, margin, yPos);
          
          const catText = categories[cat].join(', ');
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105);
          const skillLines = doc.splitTextToSize(catText, contentWidth - 35);
          doc.text(skillLines, margin + 35, yPos);
          yPos += (skillLines.length * 4.2) + 2.5;
        });
        yPos += 2;
      }

      // 4. PROYEK UNGGULAN
      if (projects && projects.length > 0) {
        const topProjects = projects.slice(0, 4);
        renderSectionHeader('Proyek Portofolio Terpilih');
        topProjects.forEach(proj => {
          checkPageBreak(14);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(15, 23, 42);
          doc.text(proj.title, margin, yPos);

          const statusStr = `[${proj.category}] - ${proj.status || 'Selesai'}`;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(statusStr, margin + contentWidth, yPos, { align: 'right' });
          yPos += 4;

          if (proj.techStack && proj.techStack.length > 0) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            doc.setTextColor(14, 116, 144);
            doc.text(`Teknologi: ${proj.techStack.join(', ')}`, margin, yPos);
            yPos += 3.8;
          }

          const desc = proj.shortDesc || proj.fullDesc;
          if (desc) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(71, 85, 105);
            const pLines = doc.splitTextToSize(desc, contentWidth);
            checkPageBreak(pLines.length * 4);
            doc.text(pLines, margin, yPos);
            yPos += (pLines.length * 4) + 3;
          }
        });
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `CV ${profile.name || 'Siswa SMK'} — BibTzy Portfolio • Halaman ${i} dari ${pageCount}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        );
      }

      // Format file name safely
      const cleanName = (profile.name || 'Habib-Ramadhan')
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      const fileName = `CV-${cleanName}.pdf`;

      doc.save(fileName);
      return { success: true, fileName };
    } catch (err) {
      console.error('[pdfService] Error generating PDF:', err);
      return { success: false, error: err.message };
    }
  }
};
