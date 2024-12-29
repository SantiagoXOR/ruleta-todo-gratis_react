import { Request, Response } from 'express';
import { UniqueCode, IUniqueCode } from '../models/UniqueCode';

export const uniqueCodeController = {
  async generateCode(req: Request, res: Response) {
    try {
      const { prizeId, code } = req.body;

      if (!prizeId || !code) {
        return res.status(400).json({
          success: false,
          error: 'Se requiere prizeId y code',
        });
      }

      // Verificar si el código ya existe
      const existingCode = await UniqueCode.findOne({ code });
      if (existingCode) {
        return res.status(400).json({
          success: false,
          error: 'El código ya existe',
        });
      }

      // Crear nuevo código
      const uniqueCode = new UniqueCode({
        code,
        prizeId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      });

      await uniqueCode.save();

      return res.status(201).json({
        success: true,
        data: uniqueCode,
      });
    } catch (error) {
      console.error('Error al generar código:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al generar el código',
      });
    }
  },

  async validateCode(req: Request, res: Response) {
    try {
      const { code } = req.params;

      const uniqueCode = await UniqueCode.findOne({ code });

      if (!uniqueCode) {
        return res.status(404).json({
          success: true,
          isValid: false,
          error: 'Código no encontrado',
        });
      }

      const isValid = !uniqueCode.isUsed && 
                     new Date() <= uniqueCode.expiresAt;

      return res.status(200).json({
        success: true,
        isValid,
        code: isValid ? uniqueCode : undefined,
      });
    } catch (error) {
      console.error('Error al validar código:', error);
      return res.status(500).json({
        success: false,
        isValid: false,
        error: 'Error al validar el código',
      });
    }
  },

  async useCode(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Se requiere userId',
        });
      }

      const uniqueCode = await UniqueCode.findOne({ code });

      if (!uniqueCode) {
        return res.status(404).json({
          success: false,
          error: 'Código no encontrado',
        });
      }

      if (uniqueCode.isUsed) {
        return res.status(400).json({
          success: false,
          error: 'El código ya ha sido usado',
        });
      }

      if (new Date() > uniqueCode.expiresAt) {
        return res.status(400).json({
          success: false,
          error: 'El código ha expirado',
        });
      }

      // Marcar código como usado
      uniqueCode.isUsed = true;
      uniqueCode.usedAt = new Date();
      uniqueCode.usedBy = userId;

      await uniqueCode.save();

      return res.status(200).json({
        success: true,
        code: uniqueCode,
      });
    } catch (error) {
      console.error('Error al usar código:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al usar el código',
      });
    }
  },

  async getCodeDetails(req: Request, res: Response) {
    try {
      const { code } = req.params;

      const uniqueCode = await UniqueCode.findOne({ code });

      if (!uniqueCode) {
        return res.status(404).json({
          success: false,
          error: 'Código no encontrado',
        });
      }

      return res.status(200).json({
        success: true,
        data: uniqueCode,
      });
    } catch (error) {
      console.error('Error al obtener detalles del código:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener detalles del código',
      });
    }
  },

  async listCodes(req: Request, res: Response) {
    try {
      const { prizeId, isUsed, page = 1, limit = 10 } = req.query;

      const query: any = {};
      if (prizeId) query.prizeId = prizeId;
      if (isUsed !== undefined) query.isUsed = isUsed === 'true';

      const codes = await UniqueCode.find(query)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const total = await UniqueCode.countDocuments(query);

      return res.status(200).json({
        success: true,
        data: {
          codes,
          total,
          page: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Error al listar códigos:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al listar los códigos',
      });
    }
  },
};
