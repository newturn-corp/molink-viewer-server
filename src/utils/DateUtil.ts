import {
    addYears,
    endOfDay,
    format,
    startOfDay,
    startOfMonth,
    startOfWeek,
    addMonths,
    addDays,
    addHours,
    addMinutes,
    addSeconds,
    subYears,
    subMonths,
    subDays,
    subHours,
    subMinutes,
    subSeconds
} from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'

class DateUtilBuilder {
    constructor (private date: Date) {}

    build () {
        return this.date
    }

    addYear (value: number) {
        this.date = addYears(this.date, value)
        return this
    }

    startOfDay () {
        this.date = startOfDay(this.date)
        return this
    }

    endOfDay () {
        this.date = endOfDay(this.date)
        return this
    }

    addMonth (value: number) {
        this.date = addMonths(this.date, value)
        return this
    }

    addDay (value: number) {
        this.date = addDays(this.date, value)
        return this
    }

    addHour (value: number) {
        this.date = addHours(this.date, value)
        return this
    }

    addMinute (value: number) {
        this.date = addMinutes(this.date, value)
        return this
    }

    addSecond (value: number) {
        this.date = addSeconds(this.date, value)
        return this
    }

    subYear (value: number) {
        this.date = subYears(this.date, value)
        return this
    }

    subMonth (value: number) {
        this.date = subMonths(this.date, value)
        return this
    }

    subDay (value: number) {
        this.date = subDays(this.date, value)
        return this
    }

    subHour (value: number) {
        this.date = subHours(this.date, value)
        return this
    }

    subMinute (value: number) {
        this.date = subMinutes(this.date, value)
        return this
    }

    subSecond (value: number) {
        this.date = subSeconds(this.date, value)
        return this
    }
}

export class DateUtil {
    static toZonedTime (date: Date): Date {
        return utcToZonedTime(date, 'Asia/Seoul')
    }

    static toZonedTimeNullable (date: Date | null): Date | null {
        return date === null ? null : DateUtil.toZonedTime(date)
    }

    /**
     * 전달된 날짜의 0시 0분 0초 0ms를 반환한다
     * @param date
     */
    static startOfDay (date: Date): Date {
        return startOfDay(date)
    }

    /**
     * 전달된 날짜의 23시 59분 59초 599 ms를 반환한다
     * @param date
     */
    static endOfDay (date: Date): Date {
        return endOfDay(date)
    }

    /**
     * 전달된 날짜가 속한 달의 1일을 반환한다
     *
     * 시간은 자정이다
     * @param date
     */
    static startOfMonth (date: Date): Date {
        return startOfMonth(date)
    }

    /**
     * 전달된 날짜가 속한 주의 월요일을 반환한다
     *
     * 시간은 자정이다
     * @param date
     */
    static startOfWeek (date: Date): Date {
        return startOfWeek(date, { weekStartsOn: 1 })
    }

    /**
     * 전달된 날짜를 서울 타임존 yyyy-MM-dd HH:mm:ss 형식의 문자열로 반환한다
     * @param date
     * @example 2021-02-20 13:30:12
     */
    static format (date: Date): string {
        return format(DateUtil.toZonedTime(date), 'yyyy-MM-dd HH:mm:ss')
    }

    /**
     * 전달된 날짜로 서울 타임존의 Date 객체를 반환한다
     *
     * 월은 1~12 사용한다
     *
     * 만약 일이 주어지지 않으면 1일이다
     *
     * 시간이 주어지지 않으면 0을 사용한다
     * @param year
     * @param month
     * @param day
     * @param hour
     * @param min
     * @param second
     * @param millisecond
     */
    static of (year: number, month: number, day?: number, hour?: number, min?: number, second?: number, millisecond?: number): Date {
        return DateUtil.toZonedTime(new Date(year, month - 1, day ?? 1, hour ?? 0, min ?? 0, second ?? 0, millisecond ?? 0))
    }

    /**
     * 현재 시간을 서울 타임존으로 반환한다
     */
    static now (): Date {
        return DateUtil.toZonedTime(new Date())
    }

    static nowBuilder (): DateUtilBuilder {
        return new DateUtilBuilder(DateUtil.now())
    }

    static builder (date: Date): DateUtilBuilder {
        return new DateUtilBuilder(date)
    }

    static endOfToday (): Date {
        return endOfDay(DateUtil.now())
    }
}
