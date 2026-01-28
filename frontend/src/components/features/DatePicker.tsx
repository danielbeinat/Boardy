import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertCircle, X } from 'lucide-react';
import { Button, Input, Modal } from '../ui';
import { format, addDays, isAfter, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  isOpen,
  onClose,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(
    selectedDate || new Date()
  );

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onChange(date.toISOString());
    onClose();
  };

  const handleClear = () => {
    setSelectedDate(null);
    onChange('');
    onClose();
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return lastDay.getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }

    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isPast = (date: Date) => {
    return isBefore(startOfDay(date), startOfDay(new Date()));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Seleccionar fecha" size="sm">
      <div className="space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            ←
          </Button>
          <h3 className="text-lg font-medium">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            →
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Weekday headers */}
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {generateCalendarDays().map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="p-2" />;
            }

            const today = isToday(date);
            const selected = isSelected(date);
            const past = isPast(date);

            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateSelect(date)}
                className={`
                  p-2 rounded-lg text-sm transition-all
                  ${today ? 'bg-blue-100 text-blue-700 font-bold' : ''}
                  ${selected ? 'bg-blue-600 text-white' : ''}
                  ${!today && !selected ? 'hover:bg-gray-100' : ''}
                  ${past && !selected ? 'text-gray-400' : 'text-gray-700'}
                `}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        {/* Quick Select Buttons */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Seleccionar rápidamente:</div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDateSelect(new Date())}
            >
              Hoy
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDateSelect(addDays(new Date(), 1))}
            >
              Mañana
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDateSelect(addDays(new Date(), 7))}
            >
              Próxima semana
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDateSelect(addDays(new Date(), 30))}
            >
              Próximo mes
            </Button>
          </div>
        </div>

        {/* Clear button */}
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Limpiar fecha
          </Button>
        )}
      </div>
    </Modal>
  );
};

interface DueDateDisplayProps {
  dueDate?: string;
  onEdit?: () => void;
  onRemove?: () => void;
}

export const DueDateDisplay: React.FC<DueDateDisplayProps> = ({
  dueDate,
  onEdit,
  onRemove,
}) => {
  if (!dueDate) return null;

  const date = new Date(dueDate);
  const today = new Date();
  const isOverdue = isAfter(today, date);
  const isToday = date.toDateString() === today.toDateString();

  const getIcon = () => {
    if (isOverdue) return <AlertCircle className="w-4 h-4" />;
    if (isToday) return <Clock className="w-4 h-4" />;
    return <Calendar className="w-4 h-4" />;
  };

  const getColor = () => {
    if (isOverdue) return 'text-red-600 bg-red-50';
    if (isToday) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs ${getColor()}`}>
      {getIcon()}
      <span>{format(date, 'd MMM', { locale: es })}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
