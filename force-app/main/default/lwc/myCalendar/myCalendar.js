/**
 * Created by Kamil Golis on 07.10.2019.
 */

import { LightningElement, track } from 'lwc';

const AVAILABLE_WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default class MyCalendar extends LightningElement {

	@track weekTemplate = [];
	@track monthTemplate = [];
	@track daysTemplate = [];
	@track eventList = [];
	@track currentDate;

	@track date = +new Date();
	@track formattedDate;

	maxDays = 37;

	connectedCallback() {
		this.drawAll();
		this.formattedDate = this.getFormattedDate(new Date(this.date));
	}

	drawAll() {
		this.drawWeekDays();
		this.drawMonths();
		this.drawDays();
		this.drawYearAndCurrentDay();
	}

	drawYearAndCurrentDay() {
		let calendar = this.getCalendar();
		let currentWeekDay = AVAILABLE_WEEK_DAYS[calendar.active.week];
		let currentDate = {year: calendar.active.year, day: calendar.active.day, weekDay: currentWeekDay};

		this.currentDate = currentDate;
	}

	drawWeekDays() {
		let weekTemplate = [];

		AVAILABLE_WEEK_DAYS.forEach((week, index) => {
			weekTemplate.push({num: index + 1, day: week.slice(0, 3)});
		});

		this.weekTemplate = weekTemplate;
	}

	drawMonths() {
		let availableMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		let monthTemplate = [];
		let calendar = this.getCalendar();

		availableMonths.forEach((month, index) => {
			let cssClass = index === calendar.active.month ? 'active' : '';
			monthTemplate.push({num: index, cssClass: cssClass, month: month});

		});
		this.monthTemplate = monthTemplate;
	}

	drawDays() {
		let calendar = this.getCalendar();
		let latestDaysInPrevMonth = this.range(calendar.active.startWeek).map((day, idx) => {
			return {
				dayNumber: this.countOfDaysInMonth(calendar.pMonth) - idx,
				month: new Date(calendar.pMonth).getMonth(),
				year: new Date(calendar.pMonth).getFullYear(),
				currentMonth: false
			}
		}).reverse();

		let daysInActiveMonth = this.range(calendar.active.days).map((day, idx) => {
			let dayNumber = idx + 1;
			let today = new Date();
			return {
				dayNumber,
				today: today.getDate() === dayNumber && today.getFullYear() === calendar.active.year && today.getMonth() === calendar.active.month,
				month: calendar.active.month,
				year: calendar.active.year,
				selected: calendar.active.day === dayNumber,
				currentMonth: true
			}
		});

		let countOfDays = this.maxDays - (latestDaysInPrevMonth.length + daysInActiveMonth.length);
		let daysInNextMonth = this.range(countOfDays).map((day, idx) => {
			return {
				dayNumber: idx + 1,
				month: new Date(calendar.nMonth).getMonth(),
				year: new Date(calendar.nMonth).getFullYear(),
				currentMonth: false
			}
		});

		let days = [...latestDaysInPrevMonth, ...daysInActiveMonth, ...daysInNextMonth];

		days = days.map(day => {
			let newDayParams = day;
			let formatted = this.getFormattedDate(new Date(`${Number(day.month)}/${day.dayNumber}/${day.year}`));
			newDayParams.hasEvent = this.eventList[formatted];
			return newDayParams;
		});

		let daysTemplate = [];
		days.forEach((day, index) => {
			let cssClass = `"${day.currentMonth ? '' : ' another-month '}${day.today ? ' active-day ' : ''}${day.selected ? ' selected-day ' : ''}${day.hasEvent ? ' event-day' : ''}" data-day="${day.dayNumber}" data-month="${day.month}" data-year="${day.year}"`;
			daysTemplate.push({num: index + 1, cssClass: cssClass, day: day.dayNumber, month: day.month, year: day.year});
		});

		this.daysTemplate = daysTemplate;
	}

	getCalendar() {
		let time = new Date(this.date);

		return {
			active: {
				days: this.countOfDaysInMonth(time),
				startWeek: this.getStartedDayOfWeekByTime(time),
				day: time.getDate(),
				week: time.getDay(),
				month: time.getMonth(),
				year: time.getFullYear(),
				formatted: this.getFormattedDate(time),
				tm: +time
			},
			pMonth: new Date(time.getFullYear(), time.getMonth() - 1, 1),
			nMonth: new Date(time.getFullYear(), time.getMonth() + 1, 1),
			pYear: new Date(new Date(time).getFullYear() - 1, 0, 1),
			nYear: new Date(new Date(time).getFullYear() + 1, 0, 1)
		}
	}

	countOfDaysInMonth(time) {
		let date = this.getMonthAndYear(time);
		return new Date(date.year, date.month + 1, 0).getDate();
	}

	getStartedDayOfWeekByTime(time) {
		let date = this.getMonthAndYear(time);
		return new Date(date.year, date.month, 1).getDay();
	}

	getMonthAndYear(time) {
		let date = new Date(time);
		return {
			year: date.getFullYear(),
			month: date.getMonth()
		}
	}

	getFormattedDate(date) {
		return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
	}

	range(number) {
		return new Array(number).fill().map((e, i) => i);
	}

	updateTime(time) {
		this.date = +new Date(time);
	}

	prevYear() {
		let calendar = this.getCalendar();
		this.updateTime(calendar.pYear);
		this.drawAll();
	}

	nextYear() {
		let calendar = this.getCalendar();
		this.updateTime(calendar.nYear);
		this.drawAll();
	}

	monthClick(e) {
		let calendar = this.getCalendar();
		let month = e.target.dataset.monthnum;

		if (!month || calendar.active.month == month) return false;

		let newMonth = new Date(calendar.active.tm).setMonth(month);

		this.updateTime(newMonth);
		this.drawAll()
	}

	dayClick(e) {
		let element = e.target.dataset;

		if (!element.day) return false;

		let strDate = `${Number(element.month) + 1}/${element.day}/${element.year}`;

		this.updateTime(strDate);
		this.drawAll();
	}
}