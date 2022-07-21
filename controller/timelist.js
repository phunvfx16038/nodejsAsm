const TimeSheet = require("../models/timesheet");
const Absent = require("../models/absent");
const workingTime = require("../public/js/calcWorkingTime");

exports.getTimeList = (req, res, next) => {
  const staffId = req.staff._id;

  let totalItems;
  TimeSheet.find({ "staff.staffId": staffId })
    .then((timesheet) => {
      const timesheets = [...timesheet];
      //check timesheet exist
      if (timesheet.length != 0) {
        const timesheetIndex = timesheet.length - 1;
        //get current worksheet and render
        timesheet[timesheetIndex].populate("staff").then((timesheet) => {
          const currentDay = timesheet.day + "/" + timesheet.month;
          const currentWorkSheetIndex = timesheet.worksheet.length - 1;
          const currentWorkSheet = timesheet.worksheet[currentWorkSheetIndex];

          Absent.find({ staffId: staffId }).then((absent) => {
            res.render("timeList/timelist", {
              pageTitle: "Tra cứu thông tin giờ làm",
              path: "/timelist",
              currentWorkSheet: currentWorkSheet,
              timesheet: timesheets,
              date: currentDay,
              absent: absent,
              timelist: true,
              salary: null,
              missingTime: null,
              salaryScale: null,
              calTotalOverTimeInMonth: null,
              covertTimeFunction: workingTime.covertSecondsToHoursAndMin,
            });
          });
        });
      } else {
        //render to timelist page when don't have timesheet
        res.render("timeList/timelist", {
          pageTitle: "Tra cứu thông tin giờ làm",
          path: "/timelist",
          timelist: false,
          timesheet: null,
        });
      }
    })
    .catch((err) => console.log(err));
};

exports.postTimeList = (req, res, next) => {
  const monthSelected = req.body.selectMonth;
  const staffId = req.staff._id;

  TimeSheet.find({ "staff.staffId": staffId }).then((timesheets) => {
    TimeSheet.find({ month: monthSelected }).then((timesheet) => {
      //check timesheet exist
      if (timesheet.length != 0) {
        //calculate total Work time of staff
        const calTotalWorkTimeInMonth = timesheet.reduce(
          (totalTimeInMonth, current) => {
            return (totalTimeInMonth =
              totalTimeInMonth + current.totalWorkTimeInDay);
          },
          0
        );

        //calculate overtime of staff
        const calTotalOverTimeInMonth = timesheet.reduce(
          (totalOverTimeInMonth, current) => {
            return (totalOverTimeInMonth =
              totalOverTimeInMonth + current.overTimeInDay);
          },
          0
        );
        //calculate standard worktime in month
        const standardTimeInMonth = timesheet.length * 8 * 3600;

        //calculate missing time
        const missingTime = standardTimeInMonth - calTotalWorkTimeInMonth;

        //get current timesheet index
        const currentTimesheetIndex = timesheet.length - 1;

        timesheet[currentTimesheetIndex]
          .populate("staff.staffId")
          .then((timesheet) => {
            const currentDay = timesheet.day + "/" + timesheet.month;
            const currentWorkSheetIndex = timesheet.worksheet.length - 1;
            const currentWorkSheet = timesheet.worksheet[currentWorkSheetIndex];

            //calculate salary
            const salary =
              timesheet.staff.staffId.salaryScale * 3000000 +
              (calTotalOverTimeInMonth / 3600 - missingTime / 3600) * 200000;
            //convert calTotalOverTimeInMonth and missingTime to hours

            Absent.find({ staffId: staffId }).then((absent) => {
              res.render("timeList/timelist", {
                pageTitle: "Tra cứu thông tin giờ làm",
                path: "/timelist",
                currentWorkSheet: currentWorkSheet,
                timesheet: timesheets,
                date: currentDay,
                absent: absent,
                salaryScale: timesheet.staff.staffId.salaryScale,
                timelist: true,
                salary: salary.toFixed(2),
                missingTime: missingTime,
                calTotalOverTimeInMonth: calTotalOverTimeInMonth,
                covertTimeFunction: workingTime.covertSecondsToHoursAndMin,
              });
            });
          });
      } else {
        res.render("timeList/timelist", {
          pageTitle: "Tra cứu thông tin giờ làm",
          path: "/timelist",
          timelist: false,
        });
      }
    });
  });
};
