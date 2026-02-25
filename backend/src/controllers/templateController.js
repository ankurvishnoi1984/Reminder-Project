const { Template, TemplateAttachment } = require('../models');

const getAllTemplates = async (req, res) => {
  console.log("TemplateAttachment : ", TemplateAttachment)
  try {
    const templates = await Template.findAll({
      include: [{ model: TemplateAttachment, as: 'attachments' }],
      order: [['eventType', 'ASC'], ['channel', 'ASC']]
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTemplateById = async (req, res) => {
  try {
    const template = await Template.findByPk(req.params.id, {
      include: [{ model: TemplateAttachment, as: 'attachments' }]
    });
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*const createTemplate = async (req, res) => {
  try {
    const template = await Template.create(req.body);
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};*/

const createTemplate = async (req, res) => {
  const t = await Template.sequelize.transaction();

  try {
    const template = await Template.create(req.body, { transaction: t });

    // ✅ save attachments
    if (req.files?.length) {
      const filesData = req.files.map(file => ({
        templateId: template.id,
        fileName: file.originalname,
        filePath: file.path,
        mimeType: file.mimetype,
        fileSize: file.size,
        fileType: file.mimetype.includes('pdf') ? 'pdf' : 'image'
      }));

      await TemplateAttachment.bulkCreate(filesData, { transaction: t });
    }

    await t.commit();

    res.status(201).json(template);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

const updateTemplate = async (req, res) => {
  const t = await Template.sequelize.transaction();

  try {
    const template = await Template.findByPk(req.params.id, {
      transaction: t,
    });

    if (!template) {
      await t.rollback();
      return res.status(404).json({ message: 'Template not found' });
    }

    // ✅ update template fields
    await template.update(req.body, { transaction: t });

    // ✅ handle new attachments (ADD ONLY — safe default)
    if (req.files?.length) {
      const filesData = req.files.map((file) => ({
        templateId: template.id,
        fileName: file.originalname,
        filePath: file.path,
        mimeType: file.mimetype,
        fileSize: file.size,
        fileType: file.mimetype.includes('pdf') ? 'pdf' : 'image',
      }));

      await TemplateAttachment.bulkCreate(filesData, { transaction: t });
    }

    await t.commit();

    // ✅ return updated template with attachments
    const updatedTemplate = await Template.findByPk(template.id, {
      include: [{ model: TemplateAttachment, as: 'attachments' }],
    });

    res.json(updatedTemplate);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findByPk(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    await template.destroy();
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate
};
