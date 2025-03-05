'use client'

import { useState, useEffect, useRef } from 'react'
import { FaPlus, FaUndo, FaExchangeAlt, FaSpinner, FaCheck, FaTimes, FaClock, FaCalendarAlt } from 'react-icons/fa'
import { Message } from '@/types/message'
import { validateUser } from '@/app/api/actions/validateUser'
import { getLastDialogTimestamp } from '@/app/api/actions/getLastDialogTimestamp'
import { DatePicker, ConfigProvider } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import zhCN from 'antd/lib/locale/zh_CN'
import { Popup, DatePickerView } from 'antd-mobile'

interface MessageFormProps {
  onAddMessage: (message: Message) => void
  editMessage: Message | null
  onCancelEdit: () => void
}

export default function MessageForm({ onAddMessage, editMessage, onCancelEdit }: MessageFormProps) {
  const [sender, setSender] = useState('')
  const [receiver, setReceiver] = useState('')
  const [time, setTime] = useState('')
  const [content, setContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  
  // Validation states
  const [isSenderValid, setIsSenderValid] = useState<boolean | null>(null)
  const [isReceiverValid, setIsReceiverValid] = useState<boolean | null>(null)
  const [isTimeValid, setIsTimeValid] = useState<boolean | null>(null)
  const [isValidatingSender, setIsValidatingSender] = useState(false)
  const [isValidatingReceiver, setIsValidatingReceiver] = useState(false)
  const [isValidatingTime, setIsValidatingTime] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [lastTimestamp, setLastTimestamp] = useState<number | null>(null)

  // State for mobile date picker
  const [showMobilePicker, setShowMobilePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  // Set default time to current time
  useEffect(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    
    setTime(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`)
  }, [])

  // Handle edit message
  useEffect(() => {
    if (editMessage) {
      setSender(editMessage.sender)
      setReceiver(editMessage.receiver)
      setTime(editMessage.time)
      setContent(editMessage.content)
      setIsEditing(true)
      
      // Reset validation states when editing
      setIsSenderValid(null)
      setIsReceiverValid(null)
      setIsTimeValid(null)
    }
  }, [editMessage])
  
  // Fetch last timestamp when both sender and receiver are valid
  useEffect(() => {
    if (isSenderValid && isReceiverValid && sender && receiver) {
      validateTime(time);
    }
  }, [isSenderValid, isReceiverValid, sender, receiver]);
  
  // Validate sender when it changes
  const validateSender = async () => {
    if (!sender.trim()) return
    
    setIsValidatingSender(true)
    setIsSenderValid(null)
    setValidationError('')
    
    try {
      const result = await validateUser(sender)
      setIsSenderValid(result.exists)
      
      if (!result.exists) {
        setValidationError(`发送者 ${sender} 不存在`)
      }
    } catch (error) {
      setIsSenderValid(false)
      setValidationError('验证发送者时出错')
      console.error('Error validating sender:', error)
    } finally {
      setIsValidatingSender(false)
    }
  }
  
  // Validate receiver when it changes
  const validateReceiver = async () => {
    if (!receiver.trim()) return
    
    setIsValidatingReceiver(true)
    setIsReceiverValid(null)
    setValidationError('')
    
    try {
      const result = await validateUser(receiver)
      setIsReceiverValid(result.exists)
      
      if (!result.exists) {
        setValidationError(`接收者 ${receiver} 不存在`)
      }
    } catch (error) {
      setIsReceiverValid(false)
      setValidationError('验证接收者时出错')
      console.error('Error validating receiver:', error)
    } finally {
      setIsValidatingReceiver(false)
    }
  }
  
  // Validate time against last dialog timestamp
  const validateTime = async (timeValue: string) => {
    if (!timeValue || !sender || !receiver) return;
    
    setIsValidatingTime(true);
    try {
      const result = await getLastDialogTimestamp(sender, receiver);
      
      if (result.error) {
        // Display the error from the API
        setIsTimeValid(false);
        setValidationError(`验证时间失败: ${result.error}`);
      } else if (result.timestamp !== null) {
        // Convert both timestamps to milliseconds for comparison
        const selectedTime = new Date(timeValue).getTime();
        const lastDialogTime = new Date(result.timestamp).getTime();
        
        if (selectedTime <= lastDialogTime) {
          setIsTimeValid(false);
          // Format the last dialog time for display
          const lastDate = new Date(result.timestamp);
          const formattedLastDate = formatTimeForDisplay(lastDate.toISOString());
          setValidationError(`时间必须晚于最后一条消息的时间: ${formattedLastDate}`);
        } else {
          setIsTimeValid(true);
          setValidationError('');
        }
      } else {
        // If there's no last dialog, consider it valid
        setIsTimeValid(true);
        setValidationError('');
      }
    } catch (error) {
      console.error('Error validating time:', error);
      // In case of error, don't block the user
      setIsTimeValid(true);
      setValidationError('');
    } finally {
      setIsValidatingTime(false);
    }
  }

  // Format time for display
  const formatTimeForDisplay = (timeString: string) => {
    if (!timeString) return '';
    
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return timeString;
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      return timeString;
    }
  };
  
  // Parse display time to ISO format
  const parseTimeToISO = (displayTime: string) => {
    if (!displayTime) return '';
    
    try {
      let date = new Date(displayTime);
      
      // Try to parse YYYY-MM-DD HH:MM:SS format
      if (isNaN(date.getTime())) {
        const pattern = /(\d{4})-(\d{1,2})-(\d{1,2})\s*(\d{1,2}):(\d{1,2}):(\d{1,2})/;
        const match = displayTime.match(pattern);
        
        if (match) {
          const [_, year, month, day, hour, minute, second] = match;
          date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`);
        }
      }
      
      if (isNaN(date.getTime())) {
        return displayTime;
      }
      
      return date.toISOString();
    } catch (error) {
      return displayTime;
    }
  };

  // Handle DatePicker change
  const handleDatePickerChange = (value: Dayjs | null, dateString: string | string[]) => {
    if (value) {
      // Convert to ISO format preserving local time
      const year = value.year();
      const month = value.month() + 1; // Dayjs months are 0-indexed
      const day = value.date();
      const hour = value.hour();
      const minute = value.minute();
      const second = value.second();
      
      // Format as YYYY-MM-DDTHH:MM:SS to preserve local time
      const formattedMonth = month.toString().padStart(2, '0');
      const formattedDay = day.toString().padStart(2, '0');
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      const formattedSecond = second.toString().padStart(2, '0');
      
      const isoTime = `${year}-${formattedMonth}-${formattedDay}T${formattedHour}:${formattedMinute}:${formattedSecond}`;
      setTime(isoTime);
      setIsTimeValid(null);
      
      // Validate time if sender and receiver are valid
      if (isSenderValid && isReceiverValid) {
        validateTime(isoTime);
      }
    } else {
      setTime('');
      setIsTimeValid(null);
    }
  };

  // Handle manual time input
  const handleManualTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const displayTime = e.target.value;
    const isoTime = parseTimeToISO(displayTime);
    setTime(isoTime);
    setIsTimeValid(null);
    
    // Validate time if sender and receiver are valid
    if (isSenderValid && isReceiverValid && isoTime) {
      validateTime(isoTime);
    }
  };

  // Handle mobile date picker change
  const handleMobileDatePickerChange = (value: Date) => {
    setTempDate(value);
  };

  // Confirm mobile date selection
  const confirmMobileDate = () => {
    if (tempDate) {
      // Convert to ISO format preserving local time
      const year = tempDate.getFullYear();
      const month = tempDate.getMonth() + 1; // getMonth() is 0-indexed
      const day = tempDate.getDate();
      const hour = tempDate.getHours();
      const minute = tempDate.getMinutes();
      const second = tempDate.getSeconds();
      
      // Format as YYYY-MM-DDTHH:MM:SS to preserve local time
      const formattedMonth = month.toString().padStart(2, '0');
      const formattedDay = day.toString().padStart(2, '0');
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      const formattedSecond = second.toString().padStart(2, '0');
      
      const isoTime = `${year}-${formattedMonth}-${formattedDay}T${formattedHour}:${formattedMinute}:${formattedSecond}`;
      setTime(isoTime);
      setIsTimeValid(null);
      
      // Validate time if sender and receiver are valid
      if (isSenderValid && isReceiverValid) {
        validateTime(isoTime);
      }
    }
    setShowMobilePicker(false);
  };

  // Open mobile date picker
  const openMobileDatePicker = () => {
    setTempDate(time ? new Date(time) : new Date());
    setShowMobilePicker(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!sender || !receiver || !time || !content) {
      alert('请填写所有必填字段')
      return
    }
    
    // Validate sender and receiver if not already validated
    if (isSenderValid === null) {
      await validateSender()
    }
    
    if (isReceiverValid === null) {
      await validateReceiver()
    }
    
    // Validate time if not already validated
    if (isTimeValid === null && isSenderValid && isReceiverValid) {
      await validateTime(time)
    }
    
    // Check if validation failed
    if (isSenderValid === false || isReceiverValid === false) {
      return
    }
    
    // Check if time validation failed
    if (isTimeValid === false) {
      return
    }
    
    // Calculate Unix timestamp on client side
    const unixTimestamp = Math.floor(new Date(time).getTime() / 1000)
    
    // Create message object
    const message: Message = {
      id: editMessage?.id || Date.now().toString(),
      sender,
      receiver,
      time,
      unixTimestamp,
      content,
      status: 'pending',
      verificationStatus: undefined,
      sentMessageId: undefined
    }
    
    // Add to list
    onAddMessage(message)
    
    // Reset form
    clearForm()
  }

  const clearForm = () => {
    // Reset sender and receiver
    setSender('')
    setReceiver('')
    // Reset time to current time
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    
    setTime(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`)
    setContent('')
    setIsEditing(false)
    onCancelEdit()
    
    // Reset validation states
    setValidationError('')
    setIsSenderValid(null)
    setIsReceiverValid(null)
    setIsTimeValid(null)
    setLastTimestamp(null)
  }

  const handleSwapSenderReceiver = () => {
    const tempSender = sender;
    setSender(receiver);
    setReceiver(tempSender);
    
    // Swap validation states
    const tempSenderValid = isSenderValid;
    setIsSenderValid(isReceiverValid);
    setIsReceiverValid(tempSenderValid);
    
    // Reset time validation when swapping
    setIsTimeValid(null);
    setLastTimestamp(null);
  }
  
  // Get validation icon for input
  const getValidationIcon = (isValid: boolean | null, isValidating: boolean) => {
    if (isValidating) {
      return <FaSpinner className="animate-spin text-blue-500" size={14} />;
    } else if (isValid === true) {
      return <FaCheck className="text-green-500" size={14} />;
    } else if (isValid === false) {
      return <FaTimes className="text-red-500" size={14} />;
    }
    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {validationError && (
        <div className="bg-red-100 text-red-700 p-2 rounded text-sm mb-2">
          {validationError}
        </div>
      )}
      
      {/* Desktop layout */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-3">
        <div className="flex items-center">
          <label htmlFor="sender-desktop" className="w-16 text-sm font-medium text-gray-700">发送者:</label>
          <div className="relative flex-1">
            <input
              type="text"
              id="sender-desktop"
              className={`form-control w-full pr-8 ${
                isSenderValid === false ? 'border-red-300 focus:ring-red-500 focus:border-red-500' :
                isSenderValid === true ? 'border-green-300 focus:ring-green-500 focus:border-green-500' : ''
              }`}
              value={sender}
              onChange={(e) => {
                setSender(e.target.value)
                setIsSenderValid(null)
                setIsTimeValid(null)
              }}
              onBlur={validateSender}
              required
            />
            {sender && (
              <span className="absolute right-2 top-2.5">
                {getValidationIcon(isSenderValid, isValidatingSender)}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleSwapSenderReceiver}
            className="btn btn-sm btn-outline-secondary mr-2"
            title="交换发送者/接收者"
          >
            <FaExchangeAlt size={14} />
          </button>
          <label htmlFor="receiver-desktop" className="w-16 text-sm font-medium text-gray-700">接收者:</label>
          <div className="relative flex-1">
            <input
              type="text"
              id="receiver-desktop"
              className={`form-control w-full pr-8 ${
                isReceiverValid === false ? 'border-red-300 focus:ring-red-500 focus:border-red-500' :
                isReceiverValid === true ? 'border-green-300 focus:ring-green-500 focus:border-green-500' : ''
              }`}
              value={receiver}
              onChange={(e) => {
                setReceiver(e.target.value)
                setIsReceiverValid(null)
                setIsTimeValid(null)
              }}
              onBlur={validateReceiver}
              required
            />
            {receiver && (
              <span className="absolute right-2 top-2.5">
                {getValidationIcon(isReceiverValid, isValidatingReceiver)}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="hidden md:flex md:items-center">
        <label htmlFor="time-desktop" className="w-16 text-sm font-medium text-gray-700">时间:</label>
        <div className="relative flex-1">
          <ConfigProvider locale={zhCN}>
            <DatePicker 
              showTime={{ format: 'HH:mm:ss' }}
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择日期和时间"
              onChange={handleDatePickerChange}
              className={`w-full p-2 border rounded ${
                isTimeValid === false ? 'border-red-500' : 
                isTimeValid === true ? 'border-green-500' : 'border-gray-300'
              }`}
              status={isTimeValid === false ? 'error' : undefined}
              value={time ? dayjs(time) : null}
            />
          </ConfigProvider>
          {isTimeValid !== null && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-10 pointer-events-none">
              {isTimeValid ? (
                <FaCheck className="text-green-500" />
              ) : (
                <FaTimes className="text-red-500" />
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="hidden md:flex md:items-start">
        <label htmlFor="content-desktop" className="w-16 text-sm font-medium text-gray-700 pt-2">内容:</label>
        <textarea
          id="content-desktop"
          className="form-control flex-1 min-h-[80px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      
      {/* Mobile layout */}
      <div className="md:hidden space-y-1">
        <div className="flex items-start gap-1">
          <div className="flex-1">
            <label htmlFor="sender-mobile" className="block text-xs font-medium text-gray-700 mb-0.5">发送者:</label>
            <div className="relative">
              <input
                type="text"
                id="sender-mobile"
                className={`form-control text-xs py-1.5 pr-6 ${
                  isSenderValid === false ? 'border-red-300 focus:ring-red-500 focus:border-red-500' :
                  isSenderValid === true ? 'border-green-300 focus:ring-green-500 focus:border-green-500' : ''
                }`}
                value={sender}
                onChange={(e) => {
                  setSender(e.target.value)
                  setIsSenderValid(null)
                  setIsTimeValid(null)
                }}
                onBlur={validateSender}
                required
              />
              {sender && (
                <span className="absolute right-1.5 top-2">
                  {getValidationIcon(isSenderValid, isValidatingSender)}
                </span>
              )}
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleSwapSenderReceiver}
            className="btn btn-xs btn-outline-secondary h-7 w-7 p-0 mt-5"
            title="交换发送者/接收者"
          >
            <FaExchangeAlt size={10} />
          </button>
          
          <div className="flex-1">
            <label htmlFor="receiver-mobile" className="block text-xs font-medium text-gray-700 mb-0.5">接收者:</label>
            <div className="relative">
              <input
                type="text"
                id="receiver-mobile"
                className={`form-control text-xs py-1.5 pr-6 ${
                isReceiverValid === false ? 'border-red-300 focus:ring-red-500 focus:border-red-500' :
                isReceiverValid === true ? 'border-green-300 focus:ring-green-500 focus:border-green-500' : ''
              }`}
                value={receiver}
                onChange={(e) => {
                  setReceiver(e.target.value)
                  setIsReceiverValid(null)
                  setIsTimeValid(null)
                }}
                onBlur={validateReceiver}
                required
              />
              {receiver && (
                <span className="absolute right-1.5 top-2">
                  {getValidationIcon(isReceiverValid, isValidatingReceiver)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="time-mobile" className="block text-xs font-medium text-gray-700 mb-0.5">时间:</label>
          <div className="relative">
            <div 
              className={`w-full flex items-center text-xs py-1.5 px-2 border rounded ${
                isTimeValid === false ? 'border-red-500' : 
                isTimeValid === true ? 'border-green-500' : 'border-gray-300'
              }`}
              onClick={openMobileDatePicker}
            >
              <input
                type="text"
                className="flex-1 outline-none bg-transparent"
                value={time ? formatTimeForDisplay(time) : ''}
                readOnly
                placeholder="选择日期和时间"
              />
              <button
                type="button"
                className="ml-1 text-xs text-gray-500"
              >
                选择
              </button>
            </div>
            {isTimeValid !== null && (
              <div className="absolute inset-y-0 right-12 flex items-center pointer-events-none">
                {isTimeValid ? (
                  <FaCheck className="text-green-500" />
                ) : (
                  <FaTimes className="text-red-500" />
                )}
              </div>
            )}
            {validationError && (
              <p className="text-red-500 text-xs italic mt-1">{validationError}</p>
            )}
          </div>
          
          {/* Mobile DatePicker Popup */}
          <Popup
            visible={showMobilePicker}
            onClose={() => setShowMobilePicker(false)}
            position="bottom"
            bodyStyle={{ height: '40vh' }}
          >
            <div className="p-2">
              <div className="flex justify-between items-center mb-4">
                <button 
                  type="button" 
                  className="px-3 py-1 text-gray-500"
                  onClick={() => setShowMobilePicker(false)}
                >
                  取消
                </button>
                <div className="text-center font-medium">选择日期和时间</div>
                <button 
                  type="button" 
                  className="px-3 py-1 text-blue-500 font-medium"
                  onClick={confirmMobileDate}
                >
                  确定
                </button>
              </div>
              <DatePickerView
                precision="second"
                value={tempDate || new Date()}
                onChange={handleMobileDatePickerChange}
              />
            </div>
          </Popup>
        </div>
        
        <div>
          <label htmlFor="content-mobile" className="block text-xs font-medium text-gray-700 mb-0.5">内容:</label>
          <textarea
            id="content-mobile"
            className="form-control text-xs py-1.5 min-h-[50px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="flex gap-1 pt-1">
        <button
          type="button"
          onClick={clearForm}
          className="btn btn-xs btn-secondary flex-1 py-1"
        >
          <FaUndo size={10} className="mr-0.25" />
          重置
        </button>
        
        <button
          type="submit"
          className="btn btn-xs btn-success flex-1 py-1"
          disabled={isValidatingSender || isValidatingReceiver || isValidatingTime || isTimeValid === false}
        >
          {(isValidatingSender || isValidatingReceiver || isValidatingTime) ? (
            <FaSpinner size={10} className="mr-0.25 animate-spin" />
          ) : (
            <FaPlus size={10} className="mr-0.25" />
          )}
          {isEditing ? '更新' : '添加'}
        </button>
      </div>
    </form>
  )
}
