import { Request, Response } from 'express'
import * as jwt from 'jsonwebtoken';
import * as argon2 from 'argon2';
import { config } from '../config'
import User, { UserStatus } from '../models/User'
import { AuthRequest } from '../middleware/authenticateToken'

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    //Validate input
    if (!email || !password) {
      res.status(400).json({ message: 'Email a heslo sú povinné' });
      return;
    }

    //Find user and validate credentials
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'Používateľ nebol nájdený' });
      return;
    }

    //Verify password
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Neplatné prihlasovacie údaje' });
      return;
    }

    //Check if the user is verified
    if (!user.isVerified) {
      res.status(403).json({ message: 'Prosím overte svoj email pred prihlásením' });
      return;
    }


    if(user.status === UserStatus.Pending || user.status === UserStatus.Inactive || user.status === UserStatus.Suspended) {
      res.status(403).json({
        message: 'Nemôžete sa prihlásiť, váš účet nie je aktívny'});
      return;
    }

    //Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.role },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    //Generate refresh token
    user.refreshToken = jwt.sign(
      { userId: user._id},
      config.jwtSecret,
      { expiresIn: '7d' } // Longer expiration for refresh token
    );

    await user.save();

    res.status(200).json({ token, role: user.role, message: 'Prihlásenie bolo úspešne' });
  } catch (error) {
    res.status(500).json({ message: 'Prihlásenie zlyhalo', error });
  }
};

export const logoutUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;

    // Clear the refresh token
    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.status(200).json({ message: 'Odhlásenie bolo úspešné' });
  } catch (error) {
    res.status(500).json({ message: 'Odhlásenie zlyhalo', error });
  }
};

export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, config.jwtSecret) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      res.status(401).json({ message: 'Neplatný alebo expirovaný obnovovací token' });
      return;
    }

    // Generate a new access token
    const newToken = jwt.sign(
      { userId: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token: newToken });
  } catch (error) {
    res.status(401).json({ message: 'Neplatný alebo expirovaný obnovovací token', error });
  }
};