const express = require('express');
const jwt = require('jsonwebtoken');
const Board = require('../models/Board');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's boards
router.get('/', authenticateToken, async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { createdBy: req.userId },
        { 'members.user': req.userId }
      ]
    }).populate('members.user', 'name email avatarColor')
      .populate('createdBy', 'name email avatarColor')
      .sort({ updatedAt: -1 });

    // Ensure boards have default lists if empty
    for (let board of boards) {
      if (!board.lists || board.lists.length === 0) {
        board.lists = [
          { title: 'Lista de tareas', position: 0, createdBy: req.userId, cards: [] },
          { title: 'En proceso', position: 1, createdBy: req.userId, cards: [] },
          { title: 'Hecho', position: 2, createdBy: req.userId, cards: [] }
        ];
        await board.save();
      }
    }

    res.json({
      success: true,
      data: { boards }
    });
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new board
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Board title is required'
      });
    }

    const defaultLists = [
      { title: 'Lista de tareas', position: 0, createdBy: req.userId, cards: [] },
      { title: 'En proceso', position: 1, createdBy: req.userId, cards: [] },
      { title: 'Hecho', position: 2, createdBy: req.userId, cards: [] }
    ];

    const board = new Board({
      title: title.trim(),
      description: description?.trim() || '',
      createdBy: req.userId,
      lists: defaultLists,
      members: [{
        user: req.userId,
        role: 'owner'
      }]
    });

    await board.save();
    await board.populate('members.user', 'name email avatarColor');
    await board.populate('createdBy', 'name email avatarColor');

    res.status(201).json({
      success: true,
      message: 'Board created successfully',
      data: { board }
    });
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific board
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('members.user', 'name email avatarColor')
      .populate('createdBy', 'name email avatarColor');

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    // Ensure board has default lists if empty
    if (!board.lists || board.lists.length === 0) {
      board.lists = [
        { title: 'Lista de tareas', position: 0, createdBy: req.userId, cards: [] },
        { title: 'En proceso', position: 1, createdBy: req.userId, cards: [] },
        { title: 'Hecho', position: 2, createdBy: req.userId, cards: [] }
      ];
      await board.save();
    }

    // Check if user has access to this board
    const hasAccess = board.createdBy._id.toString() === req.userId ||
      board.members.some(member => member.user._id.toString() === req.userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { board }
    });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update board
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    // Check if user is owner or admin
    const userMember = board.members.find(member => member.user.toString() === req.userId);
    const isOwner = board.createdBy.toString() === req.userId;
    const isAdmin = userMember && userMember.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (title && title.trim().length > 0) {
      board.title = title.trim();
    }
    if (description !== undefined) {
      board.description = description.trim();
    }

    await board.save();
    await board.populate('members.user', 'name email avatarColor');
    await board.populate('createdBy', 'name email avatarColor');

    res.json({
      success: true,
      message: 'Board updated successfully',
      data: { board }
    });
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete board
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    // Only owner can delete board
    if (board.createdBy.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only board owner can delete the board'
      });
    }

    await Board.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Board deleted successfully'
    });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add list to board
router.post('/:id/lists', authenticateToken, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'List title is required'
      });
    }

    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    // Check if user has access
    const hasAccess = board.createdBy.toString() === req.userId ||
      board.members.some(member => member.user.toString() === req.userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const newList = {
      title: title.trim(),
      position: board.lists.length,
      createdBy: req.userId,
      cards: []
    };

    board.lists.push(newList);
    await board.save();
    await board.populate('members.user', 'name email avatarColor');
    await board.populate('createdBy', 'name email avatarColor');

    res.status(201).json({
      success: true,
      message: 'List added successfully',
      data: { board }
    });
  } catch (error) {
    console.error('Add list error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add card to list
router.post('/:id/lists/:listId/cards', authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Card title is required'
      });
    }

    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    // Check if user has access
    const hasAccess = board.createdBy.toString() === req.userId ||
      board.members.some(member => member.user.toString() === req.userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const list = board.lists.id(req.params.listId);
    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    const newCard = {
      title: title.trim(),
      description: description?.trim() || '',
      position: list.cards.length,
      createdBy: req.userId,
      labels: []
    };

    list.cards.push(newCard);
    await board.save();
    await board.populate('members.user', 'name email avatarColor');
    await board.populate('createdBy', 'name email avatarColor');

    res.status(201).json({
      success: true,
      message: 'Card added successfully',
      data: { board }
    });
  } catch (error) {
    console.error('Add card error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update card in list
router.put('/:id/lists/:listId/cards/:cardId', authenticateToken, async (req, res) => {
  try {
    const { title, description, labels, dueDate, position } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    const list = board.lists.id(req.params.listId);
    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    const card = list.cards.id(req.params.cardId);
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    if (title !== undefined) card.title = title;
    if (description !== undefined) card.description = description;
    if (labels !== undefined) {
      console.log('Updating labels for card:', req.params.cardId, JSON.stringify(labels));
      card.labels = labels;
    }
    if (dueDate !== undefined) {
      console.log('Updating dueDate for card:', req.params.cardId, dueDate);
      card.dueDate = dueDate || null;
    }
    if (position !== undefined) card.position = position;

    // Use markModified on the specific list and card path
    board.markModified('lists');

    console.log('Saving board with updates...');
    try {
      await board.save();
      console.log('Board saved successfully');
    } catch (saveError) {
      console.error('Error saving board:', saveError);
      throw saveError;
    }
    await board.populate('members.user', 'name email avatarColor');
    await board.populate('createdBy', 'name email avatarColor');

    res.json({
      success: true,
      message: 'Card updated successfully',
      data: { board }
    });
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete card from list
router.delete('/:id/lists/:listId/cards/:cardId', authenticateToken, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    const list = board.lists.id(req.params.listId);
    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    list.cards.pull(req.params.cardId);
    await board.save();
    await board.populate('members.user', 'name email avatarColor');
    await board.populate('createdBy', 'name email avatarColor');

    res.json({
      success: true,
      message: 'Card deleted successfully',
      data: { board }
    });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
