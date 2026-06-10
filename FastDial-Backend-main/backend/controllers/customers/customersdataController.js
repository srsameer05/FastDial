// Update customer location in real-time
exports.updateLocation = async (req, res) => {
  const customer_id = req.user.customer_id;
  const { booking_id, latitude, longitude } = req.body;

  if (!customer_id || !booking_id || !latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  try {
    // Verify booking exists and belongs to this customer
    const bookingCheck = await db(
      `SELECT booking_id FROM SERVICEBOOKINGS 
       WHERE booking_id = ? AND customer_id = ? AND is_completed = FALSE AND is_cancelled = FALSE`,
      [booking_id, customer_id]
    );

    if (!bookingCheck || bookingCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active booking found for this customer"
      });
    }

    // Store location in database
    await db(
      `INSERT INTO LOCATION_TRACKING 
       (user_id, user_type, latitude, longitude, booking_id) 
       VALUES (?, 'customer', ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       latitude = VALUES(latitude),
       longitude = VALUES(longitude),
       updated_at = CURRENT_TIMESTAMP`,
      [customer_id, latitude, longitude, booking_id]
    );

    // Get socket instance
    const io = getIO();
    
    // Emit location update to the booking room
    io.to(`booking_${booking_id}`).emit('location_update', {
      user_id: customer_id,
      user_type: 'customer',
      latitude,
      longitude,
      timestamp: new Date()
    });

    res.status(200).json({
      success: true,
      message: "Location updated successfully"
    });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({
      success: false,
      message: "Error updating location",
      error: error.message
    });
  }
};

// Start location tracking
exports.startTracking = async (req, res) => {
  const customer_id = req.user.customer_id;
  const { booking_id, latitude, longitude } = req.body;

  if (!customer_id || !booking_id || !latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  try {
    // Verify booking exists and belongs to this customer
    const bookingCheck = await db(
      `SELECT booking_id FROM SERVICEBOOKINGS 
       WHERE booking_id = ? AND customer_id = ? AND is_completed = FALSE AND is_cancelled = FALSE`,
      [booking_id, customer_id]
    );

    if (!bookingCheck || bookingCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active booking found for this customer"
      });
    }

    // Store initial location in database
    await db(
      `INSERT INTO LOCATION_TRACKING 
       (user_id, user_type, latitude, longitude, booking_id) 
       VALUES (?, 'customer', ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       latitude = VALUES(latitude),
       longitude = VALUES(longitude),
       updated_at = CURRENT_TIMESTAMP`,
      [customer_id, latitude, longitude, booking_id]
    );

    // Get socket instance
    const io = getIO();
    
    // Emit initial location update to the booking room
    io.to(`booking_${booking_id}`).emit('location_update', {
      user_id: customer_id,
      user_type: 'customer',
      latitude,
      longitude,
      timestamp: new Date()
    });

    res.status(200).json({
      success: true,
      message: "Location tracking started successfully"
    });
  } catch (error) {
    console.error("Error starting location tracking:", error);
    res.status(500).json({
      success: false,
      message: "Error starting location tracking",
      error: error.message
    });
  }
}; 