const { Template } = require('../models');

const getAllTemplates = async (req, res) => {
  try {
    const templates = await Template.findAll({
      order: [['eventType', 'ASC'], ['channel', 'ASC']]
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTemplateById = async (req, res) => {
  try {
    const template = await Template.findByPk(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTemplate = async (req, res) => {
  try {
    const template = await Template.create(req.body);
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTemplate = async (req, res) => {
  try {
    const template = await Template.findByPk(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    await template.update(req.body);
    res.json(template);
  } catch (error) {
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
