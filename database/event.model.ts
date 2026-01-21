import { Schema, model, models, Document } from 'mongoose';

// TypeScript interface for Event document
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      trim: true,
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Agenda must contain at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Tags must contain at least one item',
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

/**
 * Pre-save hook to:
 * 1. Generate URL-friendly slug from title (only if title is modified)
 * 2. Normalize date to ISO format
 * 3. Normalize time to consistent format (HH:MM)
 */
EventSchema.pre('save', function (next) {
  // Generate slug only if title is new or modified
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  // Normalize date to ISO format (YYYY-MM-DD)
  if (this.isModified('date')) {
    // Enforce YYYY-MM-DD format to avoid timezone ambiguity
    const dateFormatRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = this.date.match(dateFormatRegex);
    
    if (!match) {
      return new Error('Invalid date format. Expected YYYY-MM-DD');
    }
    
    const [, year, month, day] = match;
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);
    
    // Construct UTC date to avoid timezone issues
    const dateObj = new Date(Date.UTC(yearNum, monthNum - 1, dayNum));
    
    // Validate the date is real (e.g., not 2024-02-31)
    if (
      isNaN(dateObj.getTime()) ||
      dateObj.getUTCFullYear() !== yearNum ||
      dateObj.getUTCMonth() !== monthNum - 1 ||
      dateObj.getUTCDate() !== dayNum
    ) {
      return new Error('Invalid date format');
    }
    
    this.date = dateObj.toISOString().split('T')[0];
  }

  // Normalize time to HH:MM format
  if (this.isModified('time')) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(this.time)) {
      return new Error('Time must be in HH:MM format');
    }
    // Ensure two-digit hour format
    const [hour, minute] = this.time.split(':');
    this.time = `${hour.padStart(2, '0')}:${minute}`;
  }

});

// Create unique index on slug for faster queries and uniqueness enforcement
EventSchema.index({ slug: 1 }, { unique: true });

// Create compound index for common queries
EventSchema.index({ date: 1, mode: 1 });

// Use existing model if available (prevents Next.js hot reload issues)
const Event = models.Event || model<IEvent>('Event', EventSchema);

export default Event;
