import React, { useState, useEffect } from 'react';
import AdminSider from '../AdminSider/AdminSider';
import AdminNavbar from '../AdminNavbar/AdminNavbar';
import Footer from '../../../components/Footer/Footer';
import { useParams } from 'react-router-dom';
import './ChiTietPhong.scss';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { ViewState } from '@devexpress/dx-react-scheduler';
import {
    Scheduler,
    WeekView,
    MonthView,
    Appointments,
    AppointmentTooltip,
    Toolbar,
    DateNavigator,
    TodayButton,
} from '@devexpress/dx-react-scheduler-material-ui';
import { DatePicker, Button, Layout } from 'antd';
import moment from 'moment';
import { appointments, Phong } from './data'

import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:3001');

const { Content } = Layout;

type ParamType = {
    toanha: string;
};
interface AppointmentData {
    startDate: Date;
    endDate: Date;
    phongHoc: string;
    ghiChu: string;
    tenGV: string;
    tietHoc: string;
}

const ExternalViewSwitcher = ({
    currentViewName,
    onChange,
}: {
    currentViewName: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
    <RadioGroup
        aria-label="Views"
        style={{ flexDirection: 'row' }}
        name="views"
        value={currentViewName}
        onChange={onChange}
    >
        <FormControlLabel value="Week" control={<Radio />} label="Lịch theo Tuần" />
        <FormControlLabel value="Month" control={<Radio />} label="Lịch theo Tháng" />
    </RadioGroup>
);

const ChiTietPhongHoc: React.FC = () => {
    const { toanha } = useParams<ParamType>();
    const [isRerender, setRerender] = useState(false);

    const storedData: any = localStorage.getItem('myDataKey');
    const danhSach = JSON.parse(storedData);

    socket.on('createAppointment', (DSHP: any) => {
        danhSach.DanhSachHocPhan = DSHP;
        localStorage.setItem('myDataKey', JSON.stringify(danhSach));
        setRerender(!isRerender);
    });

    socket.on('maintanceClassroom', (DSHP: any) => {
        danhSach.DanhSachHocPhan = DSHP;
        localStorage.setItem('myDataKey', JSON.stringify(danhSach));
        setRerender(!isRerender);
    });

    const [startDate, setStartDate] = useState<moment.Moment | null>(null);
    const [endDate, setEndDate] = useState<moment.Moment | null>(null);

    const [data, setData] = useState([]);
    const [isModelVisible, setModelVisible] = useState(false);

    useEffect(() => {
        const lichHoc = danhSach.DanhSachHocPhan.flatMap((monHoc) =>
            monHoc.thongTinLich.filter((lichHoc) => lichHoc.phongHoc === toanha),
        );

        const updatedData = [];

        lichHoc.forEach((lich) => {
            // Chuyển đổi endDate và startDate sang địa phương không thay đổi giá trị thời gian
            const localEndDate = new Date(lich.endDate).toLocaleString('en-US', { timeZone: 'UTC' });
            const localStartDate = new Date(lich.startDate).toLocaleString('en-US', { timeZone: 'UTC' });

            updatedData.push({
                ...lich,
                endDate: localEndDate,
                startDate: localStartDate,
            });
        });

        if (updatedData) {
            // Nếu tìm thấy môn học, cập nhật data bằng môn học đó
            setData(updatedData);
        }
    }, [isRerender]);

    const handleMaintance = async () => {
        const convertedStartDate = new Date(startDate);
        const convertedEndDate = new Date(endDate);

        const filteredData = data.filter((item) => {
            const itemStartDate = new Date(item.startDate);
            const itemEndDate = new Date(item.endDate);
            return itemStartDate >= convertedStartDate && itemEndDate <= convertedEndDate;
        });
        console.log("data", filteredData);
        try {
            const response = await fetch('http://localhost:3001/admin/maintaince-classroom', {
                method: 'POST',
                body: JSON.stringify(filteredData),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                console.log('oke');
            } else {
                console.log('fail');
            }
        } catch (error) {
            console.error('Error:', error);
        }
        setMaintenance(false)
    };
    const [currentViewName, setCurrentViewName] = useState('Week');

    const currentViewNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentViewName(e.target.value);
    };

    const Appointment: React.FC<{
        children: React.ReactNode;
        style: React.CSSProperties;
        data: AppointmentData;
    }> = ({ children, style, data, ...restProps }) => {
        const dynamicBackgroundColor = data.ghiChu === "Tạm ngưng" ? 'rgb(248, 200, 195)' : '';
        return (
            <Appointments.Appointment
                {...restProps}
                style={{
                    ...style,
                    backgroundColor: dynamicBackgroundColor,
                    borderRadius: '8px',
                }}
            >
                {children}
                <div style={{ color: '#000', paddingLeft: 4 + '%' }}>
                    GV: <span style={{ color: 'red' }}>{data.tenGV}</span>
                </div>
                <div style={{ color: '#000', paddingLeft: 4 + '%' }}>
                    Tiết: <span style={{ color: 'red' }}>{data.tietHoc}</span>
                </div>
                <div style={{ color: '#000', paddingLeft: 4 + '%' }}>
                    Phòng: <span style={{ color: 'red' }}>{data.phongHoc}</span>
                </div>
                <div style={{ color: '#000', paddingLeft: 4 + '%' }}>

                    Ghi chú: <span style={{ color: 'red' }}>
                        {data.ghiChu}
                    </span>

                </div>
            </Appointments.Appointment>
        )
    }

    const customAppointment: React.FC<{
        children: React.ReactNode;
        style: React.CSSProperties;
    }> = ({ children, style, ...restProps }) => (
        <Appointments.Appointment
            {...restProps}
            style={{
                ...style,
                /* backgroundColor: '#FFC107', */
                borderRadius: '8px',
            }}
        >
            {children}
        </Appointments.Appointment>
    );

    const toggleModelVisibility = () => {
        setModelVisible(!isModelVisible);
    };
    const toggleClose = () => {
        setModelVisible(false);
    };
    ///-------------
    const [formData, setFormData] = useState({
        title: '',
        member: [],
        phongHoc: toanha,
        ghiChu: '',
        startDate: '',
        endDate: '',
    });
    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData({
    //         ...formData,
    //         [name]: value,
    //     });
    // };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const [statusAddMember, setStatusAddMember] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    const handleMemberSelection = (e) => {
        const memberName = e.target.value;
        const isChecked = e.target.checked;

        let updatedMembers = [...selectedMembers];

        if (isChecked) {
            updatedMembers = [...selectedMembers, memberName];
        } else {
            updatedMembers = selectedMembers.filter((name) => name !== memberName);
        }

        setSelectedMembers(updatedMembers);

        // Cập nhật formData
        setFormData({
            ...(formData as any),
            member: updatedMembers,
        });
    };

    const handleAddMember = () => {
        setStatusAddMember(!statusAddMember);
    };

    const [des, setDes] = useState(false);
    const handleShowDes = () => {
        setDes(true);
    };
    const handleLoserDes = () => {
        setDes(false);
    };

    const chitiet = danhSach.DanhSachPhongHoc.find((phong) => {
        return phong.maPhong === toanha;
    });

    const handleAddAppointment = async (e: any) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/admin/create-appointment', {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                console.log('oke');
                setModelVisible(false);
            } else {
                console.log('fail');
            }
        } catch (error) {
            console.error('Error:', error);
        }


    };
    ///---------------
    const [phong, setPhong] = useState({
        maPhong: chitiet.maPhong,
        sucChua: chitiet.sucChua,
        trangThai: chitiet.trangThai,
        tenNha: chitiet.tenNha,
        loaiPhong: {
            tenLoaiPhong: chitiet.loaiPhong.tenLoaiPhong,
            thietBi: chitiet.loaiPhong.thietBi.map((item) => ({
                tenThietBi: item.tenThietBi,
                soLuong: item.soLuong,
            })),
        },
    });

    // Xử lí change input
    const handleInputChange = (field, value) => {
        setPhong({ ...phong, [field]: value });
    };
    const handleInputChange2 = (field, value) => {
        setPhong((prevPhong) => ({
            ...prevPhong,
            loaiPhong: {
                ...prevPhong.loaiPhong,
                [field]: value,
            },
        }));
    };
    // Xử lý + add input thiết bị 
    const handleAddButtonClick = () => {
        setPhong({
            ...phong,
            loaiPhong: {
                ...phong.loaiPhong,
                thietBi: [...phong.loaiPhong.thietBi, { tenThietBi: '', soLuong: '' }],
            },
        });
    };

    // Xử lý  ô input "Tên thiết bị" và "Số lượng" thay đổi
    const handleThietBiInputChange = (index, field, value) => {
        const updatedThietBi = [...phong.loaiPhong.thietBi];
        updatedThietBi[index][field] = value;

        setPhong({
            ...phong,
            loaiPhong: {
                ...phong.loaiPhong,
                thietBi: updatedThietBi,
            },
        });
    };

    ///--------------------------xử lí Update ở đây
    const handleFormSubmit = (e) => {
        e.preventDefault();
        setDes(false)
        console.log(phong);
    };
    ///---------------
    const [maintenance, setMaintenance] = useState(false)

    const handleShowMain = () => {
        setMaintenance(!maintenance)
    }

    const [doiLich, setDoiLich] = useState(false)

    const handleShowDoiLich = () => {
        setDoiLich(!doiLich)
        setMaintenance(false)
    }
    //---lấy phòng
    const [selectedItem, setSelectedItem] = useState(null);

    const handleClick = (i) => {
        setSelectedItem(i)
    };


    return (
        <>
            <AdminNavbar />
            <Layout style={{ minHeight: '100vh', marginTop: '2px' }}>
                <AdminSider />
                <Layout>
                    <Content>
                        <div className="PhongHoc__content">
                            <div className="PhongHoc__lichHoc">
                                <div className="PhongHoc__ten">
                                    <h2>Lịch của phòng {toanha}</h2>
                                </div>
                                <div className={`PhongHoc__lich ${isModelVisible ? 'faded' : ''}`}>
                                    <div className="PhongHoc__button">
                                        <div className="PhongHoc__add">
                                            <Button type="primary" onClick={toggleModelVisibility}>
                                                Thêm cuộc họp
                                            </Button>

                                            <Button
                                                type="primary"
                                                style={{ marginLeft: '25px' }}
                                                onClick={handleShowDes}
                                            >
                                                Chi tiết phòng
                                            </Button>
                                        </div>
                                        <div className="PhongHoc__update">
                                            <DatePicker
                                                className="date"
                                                placeholder="Ngày bắt đầu"
                                                value={startDate}
                                                onChange={(date) => setStartDate(date)}
                                                format="YYYY-MM-DD"
                                            />
                                            <DatePicker
                                                className="date"
                                                placeholder="Ngày kết thúc"
                                                value={endDate}
                                                onChange={(date) => setEndDate(date)}
                                                format="YYYY-MM-DD"
                                            />
                                            <Button type="primary" onClick={handleShowMain} className="update">
                                                Bảo Trì
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="PhongHoc__danhsach">
                                        <React.Fragment>
                                            <ExternalViewSwitcher
                                                currentViewName={currentViewName}
                                                onChange={currentViewNameChange}
                                            />
                                            <Paper>
                                                <Scheduler data={data} height={620}>
                                                    <ViewState
                                                        defaultCurrentDate="2023-10-24"
                                                        currentViewName={currentViewName}
                                                    />
                                                    <WeekView
                                                        startDayHour={5.5} // Giờ bắt đầu buổi sáng
                                                        endDayHour={21} // Giờ kết thúc buổi tối
                                                        cellDuration={60}
                                                    // timeTableCellComponent={CustomTimeTableCell}
                                                    />
                                                    <MonthView />
                                                    <Toolbar />
                                                    <DateNavigator />
                                                    <TodayButton />

                                                    <Appointments
                                                        appointmentComponent={
                                                            currentViewName === 'Week' ? Appointment : customAppointment
                                                        }
                                                    />
                                                    {currentViewName === 'Month' ? (
                                                        <AppointmentTooltip showCloseButton />
                                                    ) : (
                                                        <></>
                                                    )}
                                                </Scheduler>
                                            </Paper>
                                        </React.Fragment>
                                    </div>
                                </div>
                            </div>


                            {/* form đổi lịch----------------------------- */}
                            {doiLich ? (
                                <div className='PhongHoc_doiLich'>
                                    <div onClick={handleShowDoiLich} style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
                                        <div className='PhongHoc_doiLich_close'>x</div>
                                    </div>
                                    <div className='PhongHoc_doiLich_dslich'>
                                        <h4 style={{ textAlign: "center" }}>Các lịch trong phòng cần đổi</h4>
                                        <div className='card-grid'>
                                            {appointments.map((appointment, index) => (
                                                <div className='card' key={index} style={{ backgroundColor: "#9fcaf8" }}>
                                                    <h6>{appointment.title}</h6>
                                                    <p>
                                                        <strong>Ngày:</strong> {appointment.startDate.toLocaleDateString()}
                                                    </p>
                                                    <p>
                                                        <strong>Thời gian:</strong> {`${appointment.startDate.getHours()}:${appointment.startDate.getMinutes()} - ${appointment.endDate.getHours()}:${appointment.endDate.getMinutes()}`}
                                                    </p>
                                                    <p><strong>Phòng học:</strong> {appointment.phongHoc}</p>
                                                    <p><strong>Giáo viên:</strong> {appointment.tenGV}</p>
                                                    <p><strong>Ghi chú:</strong> {appointment.ghiChu}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className='PhongHoc_doiLich_dsphong'>
                                        <h5 style={{ textAlign: "center" }}>Danh sách phòng phù hợp</h5>
                                        <div className='PhongDoiLichGrid'>
                                            {Phong.map((phong, i) => (
                                                <div className={`PhongDoiLichItem${i === selectedItem ? ' clicked' : ''}`}

                                                    key={i}
                                                    onClick={() => handleClick(i)}>
                                                    <h6>{phong.tenPhong}</h6>
                                                    <p><strong>Sức chứa:</strong> {phong.sucChua}</p>
                                                </div>
                                            ))}
                                        </div>

                                    </div>
                                    <div className='PhongHoc_doiLich_btn'>
                                        <Button type='primary'>Đổi Phòng</Button>
                                    </div>
                                </div>
                            ) : (<></>)}



                            <div className="PhongHoc_form">
                                {/* form xác nhận tạm ngưng hay đổi lịch ----------------------*/}
                                {maintenance ? (<div>
                                    <div className='PhongHoc_formMaintance' >
                                        <div className='PhongHoc_formMaintance_button'>
                                            <div onClick={handleShowMain} className='PhongHoc_formMaintance_close'>x</div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: "center" }}>
                                            <h6 style={{ fontWeight: "bold" }}>Bạn muốn tạm ngưng lịch hay đổi phòng?</h6>
                                        </div>
                                        <div style={{ marginTop: "30px", display: 'flex', justifyContent: "center" }}>
                                            <Button type='primary' onClick={handleMaintance} style={{ marginRight: "70px" }} >Tạm ngưng</Button>
                                            <Button type='primary' onClick={handleShowDoiLich}
                                                style={{ backgroundColor: 'rgba(255, 0, 0, 0.5)', borderColor: 'red', color: 'white' }}>
                                                Đổi phòng</Button>
                                        </div>

                                    </div>
                                </div>) : (<></>)}


                                {des ? (
                                    <div className='Phong_container_bg'>
                                        <div className="Phong_container">
                                            <div className="Phong_button" >
                                                <div className="Phong_close-button" onClick={handleLoserDes}>x</div>
                                            </div>
                                            <form>
                                                <div className="form-input">
                                                    <label htmlFor="">Tên Phòng:</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Tên phòng"
                                                        value={phong.maPhong}
                                                        onChange={(e) => handleInputChange('maPhong', e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-input">
                                                    <label htmlFor="">Sức Chứa:</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Sức Chứa"
                                                        value={phong.sucChua}
                                                        onChange={(e) => handleInputChange('sucChua', e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-input">
                                                    <label htmlFor="">Tên Nhà:</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Tên Nhà"
                                                        value={phong.tenNha}
                                                        //onChange={(e) => handleInputChange('tenNha', e.target.value)}
                                                        readOnly
                                                    />
                                                </div>
                                                <div className="form-input">
                                                    <label htmlFor="">Loại Phòng:</label>
                                                    <select

                                                        value={phong.loaiPhong.tenLoaiPhong}
                                                        onChange={(e) => handleInputChange2('tenLoaiPhong', e.target.value)}
                                                    >
                                                        <option value="Phòng Thực Hành">Phòng Thực Hành</option>
                                                        <option value="Phòng Lý Thuyết">Phòng Lý Thuyết</option>
                                                    </select>
                                                </div>

                                                <div className="form-input">
                                                    <label htmlFor="">Thêm thiết bị:</label>
                                                    <Button type="primary" onClick={handleAddButtonClick} className='Phong_themThietBi'>
                                                        +
                                                    </Button>
                                                </div>

                                                {phong.loaiPhong.thietBi.map((thietBi, index) => (
                                                    <div key={index} className='input_ThietBi'>
                                                        <div className="input_ThietBi_form">
                                                            <label className=''>Tên thiết bị</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Tên thiết bị"
                                                                value={thietBi.tenThietBi}
                                                                onChange={(e) => handleThietBiInputChange(index, 'tenThietBi', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="input_ThietBi_form" style={{ marginLeft: "30px" }}>
                                                            <label htmlFor="" style={{ marginTop: "7px" }}>Số Lượng</label>
                                                            <input
                                                                className='soluong'
                                                                type="text"
                                                                placeholder="Số lượng"
                                                                value={thietBi.soLuong}
                                                                onChange={(e) => handleThietBiInputChange(index, 'soLuong', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}

                                                <Button type='primary' onClick={handleFormSubmit} style={{ margin: "15px", width: "150px", height: "35px" }}>
                                                    Cập nhất
                                                </Button>
                                            </form>
                                        </div>
                                    </div>
                                ) : (
                                    <></>
                                )}

                                {isModelVisible && (
                                    <div className="form-container">
                                        <h2>Thêm cuộc họp</h2>
                                        <div onClick={toggleClose} className="form-button-close">
                                            <div className="form-button-close-x">x</div>
                                        </div>
                                        <div>
                                            <label className="form-label">Tiêu đề</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Thành viên cuộc họp</label>
                                            <Button
                                                onClick={handleAddMember}
                                                style={{ margin: 'auto', paddingTop: 4 + 'px' }}
                                                type="primary"
                                            >
                                                Thêm
                                                <i
                                                    style={{ marginLeft: 8 + 'px' }}
                                                    className="fa-solid fa-circle-plus"
                                                ></i>
                                            </Button>
                                            {statusAddMember === true ? (
                                                <>
                                                    {danhSach.DanhSachGiaoVien.map((value: any, key: any) => (
                                                        <div key={key}>
                                                            <label>
                                                                <input
                                                                    type="checkbox"
                                                                    value={value.ThongTinCaNhan.hoTenGV}
                                                                    checked={selectedMembers.includes(
                                                                        value.ThongTinCaNhan.hoTenGV,
                                                                    )}
                                                                    onChange={handleMemberSelection}
                                                                />
                                                                {value.ThongTinCaNhan.hoTenGV}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                <></>
                                            )}
                                        </div>
                                        <div>
                                            <label className="form-label">Phòng học: </label>
                                            <input type="text" value={toanha} className="form-input" readOnly />
                                        </div>
                                        <div>
                                            <label className="form-label">Ghi chú: </label>
                                            <textarea
                                                className="form-textarea"
                                                name="ghiChu"
                                                value={formData.ghiChu}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Giờ bắt đầu: </label>
                                            <input
                                                className="form-input"
                                                type="datetime-local"
                                                name="startDate"
                                                value={formData.startDate}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Giờ kết thúc: </label>
                                            <input
                                                className="form-input"
                                                type="datetime-local"
                                                name="endDate"
                                                value={formData.endDate}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div>
                                            <button
                                                type="submit"
                                                onClick={handleAddAppointment}
                                                className="form-button"
                                            >
                                                Thêm
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Content>
                </Layout>
            </Layout>
            <Footer />
        </>
    );
};

export default ChiTietPhongHoc;
