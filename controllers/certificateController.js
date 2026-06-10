import crypto from "crypto";
import QRCode from "qrcode";
import { Op } from "sequelize";
import Certificate from "../models/Certificate.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { logAction } from "../utils/auditLogger.js";

const mapCert = (cert) => {
  if (!cert) return null;
  const data = cert.toJSON ? cert.toJSON() : cert;
  // Map backend fields to frontend expectations
  const formatted = {
    id: data.id,
    _id: data.id,
    title: data.certificateTitle,
    organization: data.issuingOrganization,
    issueDate: data.issueDate,
    verified: data.verified,
    category: data.category,
    verificationUrl: data.verificationUrl,
    preview: data.certificateFile,
    ...data,
  };
  if (formatted.user && typeof formatted.user === "object") {
    formatted.userId = {
      ...formatted.user,
      _id: formatted.user.id,
    };
    delete formatted.user;
  }
  return formatted;
};

const mapUser = (user) => {
  if (!user) return null;
  const data = user.toJSON ? user.toJSON() : user;
  return { ...data, _id: data.id };
};

export const getCertificates = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.search) {
    filter[Op.or] = [
      { certificateTitle: { [Op.like]: `%${req.query.search}%` } },
      { certificateId: { [Op.like]: `%${req.query.search}%` } },
    ];
  }
  if (req.query.category) filter.category = req.query.category;

  const certs = await Certificate.findAll({
    where: filter,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["fullName", "email"],
      },
    ],
    order: [["issueDate", "DESC"]],
  });

  const formatted = certs.map(mapCert);
  res.json(new ApiResponse(200, formatted, "Certificates fetched"));
});

export const getCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: "user",
        attributes: ["fullName", "email"],
      },
    ],
  });
  if (!cert) throw new ApiError(404, "Certificate not found");
  res.json(new ApiResponse(200, mapCert(cert), "Certificate fetched"));
});

export const createCertificate = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.certificateFile = req.file.secure_url || req.file.path;

  if (!data.certificateId) {
    data.certificateId = `CERT-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  }

  data.verificationUrl = `${process.env.FRONTEND_URL}/verify?id=${data.certificateId}`;
  try {
    data.qrCode = await QRCode.toDataURL(data.verificationUrl);
  } catch (_e) {
    /* QR generation failed, continue without it */
  }

  const cert = await Certificate.create(data);
  await logAction(req.admin.id, "CREATE", "Certificate", cert.id, {
    certificateId: cert.certificateId,
  });
  res.status(201).json(new ApiResponse(201, mapCert(cert), "Certificate created"));
});

export const updateCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findByPk(req.params.id);
  if (!cert) throw new ApiError(404, "Certificate not found");

  const data = { ...req.body };
  if (req.file) data.certificateFile = req.file.secure_url || req.file.path;

  await cert.update(data);
  await logAction(req.admin.id, "UPDATE", "Certificate", cert.id, {
    certificateId: cert.certificateId,
  });
  res.json(new ApiResponse(200, mapCert(cert), "Certificate updated"));
});

export const deleteCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findByPk(req.params.id);
  if (!cert) throw new ApiError(404, "Certificate not found");
  await cert.destroy();
  await logAction(req.admin.id, "DELETE", "Certificate", cert.id, {
    certificateId: cert.certificateId,
  });
  res.json(new ApiResponse(200, {}, "Certificate deleted"));
});

export const verifyCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findOne({
    where: { certificateId: req.params.certificateId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["fullName", "email", "designation", "profilePhoto"],
      },
    ],
  });

  if (!cert) {
    return res
      .status(404)
      .json(new ApiResponse(404, { valid: false }, "Certificate is Invalid"));
  }

  res.json(
    new ApiResponse(
      200,
      {
        valid: true,
        certificate: {
          title: cert.certificateTitle,
          issueDate: cert.issueDate,
          organization: cert.issuingOrganization,
          preview: cert.certificateFile,
          certificateId: cert.certificateId,
          category: cert.category,
          user: mapUser(cert.user),
        },
      },
      "Certificate is Valid",
    ),
  );
});
