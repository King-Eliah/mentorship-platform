import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';

// Submit incident report
export const submitIncidentReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      category, 
      severity, 
      description, 
      location, 
      involvedParties, 
      witnessNames, 
      attachments, 
      isAnonymous 
    } = req.body;

    const report = await prisma.incidentReport.create({
      data: {
        reporterId: req.user!.id,
        category,
        severity,
        description,
        location: location || null,
        involvedParties: involvedParties || [],
        witnessNames: witnessNames || null,
        attachments: attachments || null,
        isAnonymous: isAnonymous || false,
        status: 'OPEN',
      },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Create notification for admins
    try {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true, email: true },
      });

      console.log('📋 [INCIDENT NOTIFICATION] Found admins:', admins);

      const reporterName = report.isAnonymous ? 'Anonymous' : `${report.reporter.firstName} ${report.reporter.lastName}`;
      
      for (const admin of admins) {
        const notification = await prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'SYSTEM',
            title: `New incident report from ${reporterName}`,
            message: `${severity} - ${category}: ${description.substring(0, 50)}...`,
          },
        });
        console.log(`✓ Created notification ${notification.id} for admin ${admin.email} (${admin.id})`);
      }
      console.log(`✓ Incident notifications created for ${admins.length} admins`);
    } catch (notifError) {
      console.error('Error creating incident notification:', notifError);
    }

    console.log('✅ [SUBMIT INCIDENT] Incident report submitted:', report.id);
    res.status(201).json({ report });
  } catch (error) {
    console.error('❌ [SUBMIT INCIDENT] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's incident reports
export const getUserIncidentReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reports = await prisma.incidentReport.findMany({
      where: { reporterId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ reports });
  } catch (error) {
    console.error('❌ [GET USER INCIDENTS] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all incident reports (admin only)
export const getAllIncidentReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const { status, severity, category } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (category) where.category = category;

    const reports = await prisma.incidentReport.findMany({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: [
        { severity: 'desc' }, // Critical first
        { createdAt: 'desc' },
      ],
    });

    res.json({ reports });
  } catch (error) {
    console.error('❌ [GET ALL INCIDENTS] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single incident report
export const getIncidentReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const report = await prisma.incidentReport.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!report) {
      res.status(404).json({ message: 'Incident report not found' });
      return;
    }

    // Check access permissions
    if (report.reporterId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    res.json({ report });
  } catch (error) {
    console.error('❌ [GET INCIDENT] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update incident report (admin only)
export const updateIncidentReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const { id } = req.params;
    const { status, resolution } = req.body;

    const report = await prisma.incidentReport.findUnique({ where: { id } });

    if (!report) {
      res.status(404).json({ message: 'Incident report not found' });
      return;
    }

    const updated = await prisma.incidentReport.update({
      where: { id },
      data: { status, resolution },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    res.json({ report: updated });
  } catch (error) {
    console.error('❌ [UPDATE INCIDENT] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete incident report
export const deleteIncidentReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const report = await prisma.incidentReport.findUnique({ where: { id } });

    if (!report) {
      res.status(404).json({ message: 'Incident report not found' });
      return;
    }

    if (report.reporterId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    await prisma.incidentReport.delete({ where: { id } });

    res.json({ message: 'Incident report deleted successfully' });
  } catch (error) {
    console.error('❌ [DELETE INCIDENT] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get incident statistics (admin only)
export const getIncidentStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const [total, open, inProgress, resolved, critical, high] = await Promise.all([
      prisma.incidentReport.count(),
      prisma.incidentReport.count({ where: { status: 'OPEN' } }),
      prisma.incidentReport.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.incidentReport.count({ where: { status: 'RESOLVED' } }),
      prisma.incidentReport.count({ where: { severity: 'CRITICAL' } }),
      prisma.incidentReport.count({ where: { severity: 'HIGH' } }),
    ]);

    res.json({
      stats: {
        total,
        open,
        inProgress,
        resolved,
        critical,
        high,
      },
    });
  } catch (error) {
    console.error('❌ [GET INCIDENT STATS] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
