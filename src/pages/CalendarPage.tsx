import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Bell, CheckSquare, FileText } from 'lucide-react';
import { Task, Reminder, Note } from '../types';

interface CalendarPageProps {
  tasks: Task[];
  reminders: Reminder[];
  notes: Note[];
}

export function CalendarPage({ tasks, reminders, notes }: CalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => { setCurrentDate(new Date()); setSelectedDate(new Date()); };

  const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
  const dayNames = ['Du', 'Se', 'Chor', 'Pay', 'Ju', 'Shan', 'Yak'];

  // Adjust firstDay to start from Monday
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    const dayTasks = tasks.filter(t => !t.isTrashed && t.dueDate && new Date(t.dueDate).toDateString() === dateStr);
    const dayReminders = reminders.filter(r => !r.isTrashed && new Date(r.dateTime).toDateString() === dateStr);
    const dayNotes = notes.filter(n => !n.isTrashed && !n.isArchived && new Date(n.createdAt).toDateString() === dateStr);
    return { tasks: dayTasks, reminders: dayReminders, notes: dayNotes };
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : null;

  // Generate calendar days
  const calendarDays = [];
  for (let i = 0; i < adjustedFirstDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 card p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={goToToday} className="px-3 py-1.5 text-sm rounded-lg bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors">
                Bugun
              </button>
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                <ChevronLeft size={20} className="text-surface-500" />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                <ChevronRight size={20} className="text-surface-500" />
              </button>
            </div>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-medium text-surface-500 dark:text-surface-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-surface-200 dark:bg-surface-700 rounded-lg overflow-hidden">
            {calendarDays.map((date, index) => {
              if (!date) return <div key={`empty-${index}`} className="bg-surface-50 dark:bg-surface-800 p-2 min-h-[80px]" />;
              
              const isToday = date.toDateString() === today.toDateString();
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const events = getEventsForDate(date);
              const hasEvents = events.tasks.length + events.reminders.length > 0;

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`bg-white dark:bg-surface-800 p-2 min-h-[80px] text-left transition-colors hover:bg-surface-50 dark:hover:bg-surface-700 ${isSelected ? 'ring-2 ring-inset ring-primary-500' : ''}`}
                >
                  <span className={`text-sm font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${isToday ? 'bg-primary-600 text-white' : 'text-surface-700 dark:text-surface-300'}`}>
                    {date.getDate()}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {events.tasks.slice(0, 2).map(t => (
                      <div key={t.id} className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${t.priority === 'high' ? 'bg-red-500' : t.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                        <span className="text-xs text-surface-500 truncate">{t.title}</span>
                      </div>
                    ))}
                    {events.reminders.slice(0, 1).map(r => (
                      <div key={r.id} className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span className="text-xs text-purple-500 truncate">{r.title}</span>
                      </div>
                    ))}
                    {events.tasks.length + events.reminders.length > 3 && (
                      <span className="text-xs text-surface-400">+{events.tasks.length + events.reminders.length - 3} yana</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="card p-5">
          <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-4">
            {selectedDate ? selectedDate.toLocaleDateString('uz-Latn-UZ', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Sanani tanlang'}
          </h3>
          
          {selectedDate && selectedEvents ? (
            <div className="space-y-4">
              {selectedEvents.tasks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-surface-500 flex items-center gap-2 mb-2">
                    <CheckSquare size={14} /> Vazifalar ({selectedEvents.tasks.length})
                  </h4>
                  <div className="space-y-1">
                    {selectedEvents.tasks.map(task => (
                      <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg bg-surface-50 dark:bg-surface-700/50">
                        <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-500' : task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                        <span className={`text-sm flex-1 ${task.completed ? 'line-through text-surface-400' : 'text-surface-700 dark:text-surface-300'}`}>{task.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEvents.reminders.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-surface-500 flex items-center gap-2 mb-2">
                    <Bell size={14} /> Eslatmalar ({selectedEvents.reminders.length})
                  </h4>
                  <div className="space-y-1">
                    {selectedEvents.reminders.map(reminder => (
                      <div key={reminder.id} className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <div className="flex-1">
                          <span className="text-sm text-surface-700 dark:text-surface-300">{reminder.title}</span>
                          <p className="text-xs text-surface-400">{new Date(reminder.dateTime).toLocaleTimeString('uz-Latn-UZ', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEvents.notes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-surface-500 flex items-center gap-2 mb-2">
                    <FileText size={14} /> Qaydlar ({selectedEvents.notes.length})
                  </h4>
                  <div className="space-y-1">
                    {selectedEvents.notes.map(note => (
                      <div key={note.id} className="flex items-center gap-2 p-2 rounded-lg bg-surface-50 dark:bg-surface-700/50">
                        <FileText size={12} className="text-surface-400" />
                        <span className="text-sm text-surface-700 dark:text-surface-300 truncate">{note.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEvents.tasks.length === 0 && selectedEvents.reminders.length === 0 && selectedEvents.notes.length === 0 && (
                <p className="text-sm text-surface-400 text-center py-8">Bu kunda hech narsa yo'q</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-surface-400 text-center py-8">Tafsilotlarni ko'rish uchun sanani tanlang</p>
          )}
        </div>
      </div>
    </div>
  );
}
